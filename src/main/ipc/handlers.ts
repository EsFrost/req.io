import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import { FetchResponse } from '../../shared/types';

const execAsync = promisify(exec);

export const registerHandlers = (): void => {
  ipcMain.handle('fetch-url', async (_event, url: string): Promise<FetchResponse> => {
    try {
      const { stdout, stderr } = await execAsync(`curl -s "${url}"`);
      if (stderr) {
        return { success: false, error: stderr };
      }
      return { success: true, data: stdout };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
};