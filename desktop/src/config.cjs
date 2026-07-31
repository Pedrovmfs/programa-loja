const fs = require("node:fs");
const path = require("node:path");

function configPath(userDataDir) {
  return path.join(userDataDir, "config.json");
}

function readConfig(userDataDir) {
  try {
    const raw = fs.readFileSync(configPath(userDataDir), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeConfig(userDataDir, config) {
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.writeFileSync(configPath(userDataDir), JSON.stringify(config, null, 2), "utf8");
}

function clearConfig(userDataDir) {
  try {
    fs.unlinkSync(configPath(userDataDir));
  } catch {
    // já não existia, tudo bem
  }
}

function updateConfig(userDataDir, partial) {
  const current = readConfig(userDataDir) ?? {};
  const merged = { ...current, ...partial };
  writeConfig(userDataDir, merged);
  return merged;
}

module.exports = { readConfig, writeConfig, clearConfig, updateConfig };
