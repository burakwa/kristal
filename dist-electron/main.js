import { ipcMain, app, BrowserWindow, dialog } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    frame: false,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
ipcMain.handle("window:minimize", () => {
  if (win) win.minimize();
});
ipcMain.handle("window:maximize", () => {
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});
ipcMain.handle("window:close", () => {
  if (win) win.close();
});
ipcMain.handle("dialog:openFile", async () => {
  if (!win) return null;
  const result = await dialog.showOpenDialog(win, {
    title: "PDF Dosyası Aç",
    filters: [
      { name: "PDF Dosyaları", extensions: ["pdf"] },
      { name: "Tüm Dosyalar", extensions: ["*"] }
    ],
    properties: ["openFile"]
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  const filePath = result.filePaths[0];
  const data = fs.readFileSync(filePath);
  const name = path.basename(filePath);
  return {
    name,
    data: Array.from(new Uint8Array(data)),
    path: filePath
  };
});
ipcMain.handle("dialog:saveFile", async (_event, payload) => {
  if (!win) return false;
  const result = await dialog.showSaveDialog(win, {
    title: "PDF Kaydet",
    defaultPath: payload.name,
    filters: [
      { name: "PDF Dosyaları", extensions: ["pdf"] }
    ]
  });
  if (result.canceled || !result.filePath) {
    return false;
  }
  const buffer = Buffer.from(new Uint8Array(payload.data));
  fs.writeFileSync(result.filePath, buffer);
  return true;
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
