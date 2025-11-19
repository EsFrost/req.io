import { contextBridge, ipcRenderer } from 'electron';
import { FetchResponse } from '../shared/types';

contextBridge.exposeInMainWorld('electron', {
  fetchUrl: (url: string): Promise<FetchResponse> => ipcRenderer.invoke('fetch-url', url),
});