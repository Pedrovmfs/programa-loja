const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("attualSetup", {
  getHostname: () => ipcRenderer.invoke("get-hostname"),
  getLanIps: () => ipcRenderer.invoke("get-lan-ips"),
  testConnection: (address) => ipcRenderer.invoke("test-connection", address),
  saveConfig: (config) => ipcRenderer.invoke("save-config", config),
});
