const optPrincipal = document.getElementById("opt-principal");
const optCliente = document.getElementById("opt-cliente");
const principalCard = document.getElementById("principal-card");
const clienteCard = document.getElementById("cliente-card");
const hostnameValue = document.getElementById("hostname-value");
const addressInput = document.getElementById("address");
const testBtn = document.getElementById("test-btn");
const statusEl = document.getElementById("status");
const saveBtn = document.getElementById("save-btn");

let mode = null;
let clienteTested = false;

window.attualSetup.getHostname().then((hostname) => {
  hostnameValue.textContent = hostname;
});

function selectMode(newMode) {
  mode = newMode;
  optPrincipal.classList.toggle("selected", mode === "principal");
  optCliente.classList.toggle("selected", mode === "cliente");
  principalCard.classList.toggle("hidden", mode !== "principal");
  clienteCard.classList.toggle("hidden", mode !== "cliente");
  updateSaveEnabled();
}

function updateSaveEnabled() {
  if (mode === "principal") {
    saveBtn.disabled = false;
  } else if (mode === "cliente") {
    saveBtn.disabled = !clienteTested;
  } else {
    saveBtn.disabled = true;
  }
}

optPrincipal.addEventListener("click", () => selectMode("principal"));
optCliente.addEventListener("click", () => selectMode("cliente"));

addressInput.addEventListener("input", () => {
  clienteTested = false;
  statusEl.textContent = "";
  updateSaveEnabled();
});

testBtn.addEventListener("click", async () => {
  const address = addressInput.value.trim();
  if (!address) {
    statusEl.textContent = "Digite um endereço primeiro.";
    statusEl.className = "status error";
    return;
  }
  statusEl.textContent = "Testando...";
  statusEl.className = "status";
  testBtn.disabled = true;
  const result = await window.attualSetup.testConnection(address);
  testBtn.disabled = false;
  if (result.ok) {
    statusEl.textContent = "Conectado! ✓";
    statusEl.className = "status ok";
    clienteTested = true;
  } else {
    statusEl.textContent = `Não encontrado (${result.error}). Confira o nome/endereço e se o computador principal está ligado.`;
    statusEl.className = "status error";
    clienteTested = false;
  }
  updateSaveEnabled();
});

saveBtn.addEventListener("click", async () => {
  saveBtn.disabled = true;
  const address = addressInput.value.trim();
  await window.attualSetup.saveConfig({ mode, address: mode === "cliente" ? address : null });
});
