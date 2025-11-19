const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    fetchUrl: (url) => ipcRenderer.invoke('fetch-url', url),
});