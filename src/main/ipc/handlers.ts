import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import { FetchResponse } from '../../shared/types';

const execAsync = promisify(exec);

export const registerHandlers = (): void => {
  ipcMain.handle('fetch-url', async (_event, url: string): Promise<FetchResponse> => {
    try {
      // Use curl with -w flag to get HTTP status code
      const { stdout, stderr } = await execAsync(`curl -s -w "\\n%{http_code}" "${url}"`);
      
      if (stderr) {
        return { success: false, error: stderr };
      }
      
      // Split response body and status code
      const lines = stdout.trim().split('\n');
      const statusCode = parseInt(lines[lines.length - 1]);
      const body = lines.slice(0, -1).join('\n');
      
      return { 
        success: true, 
        data: body,
        statusCode: statusCode
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
};