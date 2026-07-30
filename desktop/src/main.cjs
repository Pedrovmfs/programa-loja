const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("node:path");
const os = require("node:os");
const http = require("node:http");
const { spawn, spawnSync } = require("node:child_process");
const { readConfig, writeConfig, clearConfig } = require("./config.cjs");

const userDataDir = app.getPath("userData");
let serverProcess = null;

function resourcePath(...segments) {
  const base = app.isPackaged ? process.resourcesPath : path.join(__dirname, "..", "resources");
  return path.join(base, ...segments);
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

async function startBackend() {
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

  const dataDir = path.join(userDataDir, "data");
  const serverBundle = resourcePath("server", "index.cjs");
  const webDist = resourcePath("web");

  serverProcess = spawn(nodeExe, [serverBundle], {
    env: {
      ...process.env,
      ATTUAL_DATA_DIR: dataDir,
      ATTUAL_WEB_DIST: webDist,
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
    const ok = await startBackend();
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
  buildMenu(win);
  loadWithRetry(win, targetUrl);
}

function buildMenu(win) {
  const template = [
    {
      label: "Configurações",
      submenu: [
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
        { role: "quit", label: "Sair" },
      ],
    },
  ];
  win.setMenu(Menu.buildFromTemplate(template));
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
