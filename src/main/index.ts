import { app, BrowserWindow } from 'electron';
import { createWindow } from './window';
import { registerHandlers } from './ipc/handlers';

app.on('ready', () => {
  registerHandlers();
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