import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

const createWindow = (): void => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
};

app.on('ready', () => {
  ipcMain.handle('fetch-url', async (event, url: string) => {
    try {
      const response = await fetch(url);
      const data = await response.text();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});