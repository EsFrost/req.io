import { ipcMain, dialog } from 'electron';
import { Request, HttpResponse, Collection, Environment, HistoryEntry, Project } from '../../shared/types';
import { RequestHandler } from './request-handler';
import { CollectionStorage } from '../storage/collections';
import { EnvironmentStorage } from '../storage/environments';
import { HistoryStorage } from '../storage/history';
import { ProjectStorage } from '../storage/projects';
import { SecureProjectStorage } from '../storage/secure-projects';
import * as fs from 'fs';

const requestHandler = new RequestHandler();
const collectionStorage = new CollectionStorage();
const environmentStorage = new EnvironmentStorage();
const historyStorage = new HistoryStorage();
// const projectStorage = new ProjectStorage();
const projectStorage = new SecureProjectStorage();

export const registerHandlers = (): void => {
  // Send HTTP request
  ipcMain.handle('request:send', async (_event, request: Request): Promise<HttpResponse> => {
    const response = await requestHandler.execute(request);
    
    // Only save to history if we got a real response (not an error)
    if (response.status > 0) {
      historyStorage.add({
        id: Date.now().toString(),
        request,
        response,
        timestamp: Date.now()
      });
    }
    
    return response;
  });
  
  // Export request to JSON file
  ipcMain.handle('request:export', async (_event, request: Request): Promise<void> => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Export Request',
      defaultPath: `${request.name || 'request'}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });
    
    if (filePath) {
      const requestData = JSON.stringify(request, null, 2);
      fs.writeFileSync(filePath, requestData, 'utf-8');
    }
  });
  
  // Import request from JSON file
  ipcMain.handle('request:import', async (): Promise<Request | null> => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Import Request',
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ],
      properties: ['openFile']
    });
    
    if (filePaths && filePaths.length > 0) {
      try {
        const fileContent = fs.readFileSync(filePaths[0], 'utf-8');
        const request = JSON.parse(fileContent) as Request;
        return request;
      } catch (error) {
        console.error('Failed to parse request file:', error);
        return null;
      }
    }
    
    return null;
  });
  
  // Collection management
  ipcMain.handle('collection:save', async (_event, collection: Collection): Promise<void> => {
    collectionStorage.save(collection);
  });
  
  ipcMain.handle('collection:load', async (): Promise<Collection[]> => {
    return collectionStorage.loadAll();
  });
  
  ipcMain.handle('collection:delete', async (_event, id: string): Promise<void> => {
    collectionStorage.delete(id);
  });
  
  // Project management
  ipcMain.handle('project:save', async (_event, project: Project): Promise<void> => {
    projectStorage.save(project);
  });
  
  ipcMain.handle('project:load', async (): Promise<Project[]> => {
    return projectStorage.loadAll();
  });
  
  ipcMain.handle('project:delete', async (_event, id: string): Promise<void> => {
    projectStorage.delete(id);
  });
  
  // Export project to JSON file
  ipcMain.handle('project:export', async (_event, project: Project): Promise<void> => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Export Project',
      defaultPath: `${project.name || 'project'}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });
    
    if (filePath) {
      const projectData = JSON.stringify(project, null, 2);
      fs.writeFileSync(filePath, projectData, 'utf-8');
    }
  });
  
  // Import project from JSON file
  ipcMain.handle('project:import', async (): Promise<Project | null> => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Import Project',
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ],
      properties: ['openFile']
    });
    
    if (filePaths && filePaths.length > 0) {
      try {
        const fileContent = fs.readFileSync(filePaths[0], 'utf-8');
        const project = JSON.parse(fileContent) as Project;
        // Save imported project
        projectStorage.save(project);
        return project;
      } catch (error) {
        console.error('Failed to parse project file:', error);
        return null;
      }
    }
    
    return null;
  });
  
  // Environment management
  ipcMain.handle('environment:save', async (_event, environment: Environment): Promise<void> => {
    environmentStorage.save(environment);
  });
  
  ipcMain.handle('environment:load', async (): Promise<Environment[]> => {
    return environmentStorage.loadAll();
  });
  
  ipcMain.handle('environment:delete', async (_event, id: string): Promise<void> => {
    environmentStorage.delete(id);
  });
  
  ipcMain.handle('environment:setActive', async (_event, id: string): Promise<void> => {
    environmentStorage.setActive(id);
  });
  
  // History management
  ipcMain.handle('history:get', async (_event, limit?: number): Promise<HistoryEntry[]> => {
    return historyStorage.get(limit);
  });
  
  ipcMain.handle('history:clear', async (): Promise<void> => {
    historyStorage.clear();
  });
};