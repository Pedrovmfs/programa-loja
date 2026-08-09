const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("node:path");
const os = require("node:os");
const http = require("node:http");
const fs = require("node:fs");
const { spawn, spawnSync } = require("node:child_process");
const { readConfig, writeConfig, clearConfig, updateConfig } = require("./config.cjs");

const userDataDir = app.getPath("userData");
let serverProcess = null;

// Auto-update: nunca pode derrubar o programa principal se der problema —
// por isso o require fica protegido e toda checagem só roda se isso deu
// certo E o app está empacotado (rodando via npm/electron direto em
// desenvolvimento não tem instalador pra atualizar).
let autoUpdater = null;
try {
  ({ autoUpdater } = require("electron-updater"));
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
} catch (err) {
  console.error("electron-updater indisponível:", err);
}

let checagemManualEmAndamento = false;

if (autoUpdater) {
  autoUpdater.on("update-available", async (info) => {
    const resultado = await dialog.showMessageBox({
      type: "info",
      title: "Atualização disponível",
      buttons: ["Baixar agora", "Depois"],
      defaultId: 0,
      message: `Tem uma versão nova do programa (${info.version}).\n\nBaixar agora? O programa continua funcionando normalmente enquanto baixa.`,
    });
    if (resultado.response === 0) {
      autoUpdater.downloadUpdate().catch((err) => console.error("Erro ao baixar atualização:", err));
    } else {
      checagemManualEmAndamento = false;
    }
  });

  autoUpdater.on("update-not-available", () => {
    if (checagemManualEmAndamento) {
      dialog.showMessageBox({
        type: "info",
        title: "Tudo atualizado",
        message: "Você já está com a versão mais recente do programa.",
      });
    }
    checagemManualEmAndamento = false;
  });

  autoUpdater.on("error", (err) => {
    console.error("Erro no auto-update:", err);
    if (checagemManualEmAndamento) {
      dialog.showMessageBox({
        type: "error",
        title: "Erro ao verificar atualização",
        message: `Não consegui verificar atualizações agora: ${err?.message ?? err}`,
      });
    }
    checagemManualEmAndamento = false;
  });

  autoUpdater.on("update-downloaded", async (info) => {
    const resultado = await dialog.showMessageBox({
      type: "info",
      title: "Atualização pronta",
      buttons: ["Reiniciar agora", "Depois"],
      defaultId: 1,
      message: `A versão ${info.version} foi baixada.\n\nReiniciar agora pra instalar? (leva poucos segundos)`,
    });
    if (resultado.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
}

function verificarAtualizacoes({ manual }) {
  if (!autoUpdater || !app.isPackaged) {
    if (manual) {
      dialog.showMessageBox({
        type: "info",
        title: "Verificar Atualizações",
        message: "Essa checagem só funciona no programa instalado (.exe), não rodando em modo de desenvolvimento.",
      });
    }
    return;
  }
  if (manual) checagemManualEmAndamento = true;
  autoUpdater.checkForUpdates().catch((err) => {
    console.error("Erro ao checar atualização:", err);
    checagemManualEmAndamento = false;
  });
}

function resourcePath(...segments) {
  const base = app.isPackaged ? process.resourcesPath : path.join(__dirname, "..", "resources");
  return path.join(base, ...segments);
}

function defaultDataDir() {
  return path.join(userDataDir, "data");
}

function effectiveDataDir(config) {
  return config?.dataDir || defaultDataDir();
}

function normalizeAddress(input) {
  let addr = input.trim();
  if (!/^https?:\/\//i.test(addr)) addr = `http://${addr}`;
  const url = new URL(addr);
  if (!url.port) url.port = "4000";
  return url.toString().replace(/\/$/, "");
}

function httpGetOk(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      if (res.statusCode === 200) resolve();
      else reject(new Error(`status ${res.statusCode}`));
      res.resume();
    });
    req.on("timeout", () => req.destroy(new Error("tempo esgotado")));
    req.on("error", reject);
  });
}

async function waitForServerReady(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await httpGetOk(url, 1000);
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return false;
}

// O backend precisa rodar sob um Node.js "de verdade" (o mesmo instalado
// via instalar.bat), não sob o Node interno do Electron: o Electron embute
// uma versão de Node mais antiga que ainda não tem o módulo node:sqlite que
// o backend usa. Por isso o servidor roda como processo separado em vez de
// ser carregado dentro do próprio Electron.
function findNodeExecutable() {
  const candidates = ["node"];
  if (process.platform === "win32") {
    candidates.push("C:\\Program Files\\nodejs\\node.exe");
  }
  for (const candidate of candidates) {
    try {
      const result = spawnSync(candidate, ["--version"]);
      if (result.status === 0) return candidate;
    } catch {
      // tenta o próximo candidato
    }
  }
  return null;
}

ipcMain.handle("get-hostname", () => os.hostname());

ipcMain.handle("test-connection", async (_event, address) => {
  try {
    const base = normalizeAddress(address);
    await httpGetOk(`${base}/api/health`, 3000);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("save-config", async (_event, config) => {
  writeConfig(userDataDir, config);
  await launchMainWindow(config);
});

function openSetupWindow() {
  const setupWindow = new BrowserWindow({
    width: 720,
    height: 560,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  setupWindow.setMenuBarVisibility(false);
  setupWindow.loadFile(path.join(__dirname, "setup.html"));
  return setupWindow;
}

function loadWithRetry(win, targetUrl) {
  win.loadURL(targetUrl);
  win.webContents.once("did-fail-load", (_event, _errorCode, _errorDescription, _validatedUrl, isMainFrame) => {
    if (!isMainFrame) return;
    win.loadFile(path.join(__dirname, "retry.html"), { query: { target: targetUrl } });
  });
}

async function startBackend(config) {
  const nodeExe = findNodeExecutable();
  if (!nodeExe) {
    await dialog.showMessageBox({
      type: "error",
      title: "Node.js não encontrado",
      message:
        "Este computador precisa ter o Node.js instalado para ser o computador principal.\n\n" +
        "Baixe e instale em https://nodejs.org (versão LTS) e abra o programa de novo.",
    });
    app.quit();
    return false;
  }

  const dataDir = effectiveDataDir(config);
  fs.mkdirSync(dataDir, { recursive: true });
  const serverBundle = resourcePath("server", "index.cjs");
  const webDist = resourcePath("web");
  const logoPath = resourcePath("server", "assets", "logo.png");

  serverProcess = spawn(nodeExe, [serverBundle], {
    env: {
      ...process.env,
      ATTUAL_DATA_DIR: dataDir,
      ATTUAL_WEB_DIST: webDist,
      ATTUAL_LOGO_PATH: logoPath,
      PORT: "4000",
    },
    windowsHide: true,
    stdio: "ignore",
  });

  const ready = await waitForServerReady("http://localhost:4000/api/health", 15000);
  if (!ready) {
    await dialog.showMessageBox({
      type: "error",
      title: "Erro ao iniciar",
      message: "O servidor não respondeu a tempo. Tente abrir o programa novamente.",
    });
    app.quit();
    return false;
  }
  return true;
}

async function launchMainWindow(config) {
  let targetUrl;

  if (config.mode === "principal") {
    const ok = await startBackend(config);
    if (!ok) return;
    targetUrl = "http://localhost:4000";
  } else {
    targetUrl = normalizeAddress(config.address);
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  buildMenu(win, config);
  loadWithRetry(win, targetUrl);

  // checagem automática, silenciosa, alguns segundos depois de abrir —
  // não atrapalha a inicialização e não incomoda se não tiver nada novo
  setTimeout(() => verificarAtualizacoes({ manual: false }), 8000);
}

async function handleEscolherPastaDeDados(win, config) {
  const atual = effectiveDataDir(config);
  const escolha = await dialog.showOpenDialog(win, {
    title: "Escolher pasta onde os pedidos e documentos ficam salvos",
    defaultPath: atual,
    properties: ["openDirectory", "createDirectory"],
  });
  if (escolha.canceled || escolha.filePaths.length === 0) return;

  const novaPasta = escolha.filePaths[0];
  if (path.resolve(novaPasta) === path.resolve(atual)) return;

  const confirmado = await dialog.showMessageBox(win, {
    type: "question",
    buttons: ["Cancelar", "Mover e Reiniciar"],
    defaultId: 1,
    message: `Os pedidos e documentos salvos em:\n${atual}\n\nserão copiados para:\n${novaPasta}\n\nA pasta antiga não será apagada. O programa reinicia em seguida para usar a nova pasta.`,
  });
  if (confirmado.response !== 1) return;

  try {
    if (fs.existsSync(atual)) {
      fs.mkdirSync(novaPasta, { recursive: true });
      fs.cpSync(atual, novaPasta, { recursive: true });
    }
    updateConfig(userDataDir, { dataDir: novaPasta });
    app.relaunch();
    app.exit(0);
  } catch (err) {
    await dialog.showMessageBox(win, {
      type: "error",
      title: "Erro ao mover os dados",
      message: `Não consegui copiar os arquivos: ${err.message}`,
    });
  }
}

function buildMenu(win, config) {
  const submenu = [
    {
      label: "Verificar Atualizações",
      click: () => verificarAtualizacoes({ manual: true }),
    },
    {
      label: "Alterar modo de conexão",
      click: async () => {
        const confirmed = await dialog.showMessageBox(win, {
          type: "question",
          buttons: ["Cancelar", "Alterar"],
          defaultId: 1,
          message: "Isso vai fechar o programa para reconfigurar (computador principal ou conectar a outro).",
        });
        if (confirmed.response === 1) {
          clearConfig(userDataDir);
          app.relaunch();
          app.exit(0);
        }
      },
    },
  ];

  if (config?.mode === "principal") {
    submenu.push({
      label: "Escolher Pasta de Dados...",
      click: () => handleEscolherPastaDeDados(win, config),
    });
  }

  submenu.push({ role: "quit", label: "Sair" });

  Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: "Configurações", submenu }]));
}

app.whenReady().then(() => {
  const config = readConfig(userDataDir);
  if (config && config.mode) {
    launchMainWindow(config);
  } else {
    openSetupWindow();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) serverProcess.kill();
});
