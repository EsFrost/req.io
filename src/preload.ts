import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  fetchUrl: (url: string) => ipcRenderer.invoke('fetch-url', url),
});