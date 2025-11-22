import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Project, Auth } from '../../shared/types';
import { SecureStorage } from '../security/encryption';

export class SecureProjectStorage {
  private storagePath: string;
  
  constructor() {
    const userDataPath = app.getPath('userData');
    this.storagePath = path.join(userDataPath, 'projects.json');
    this.ensureStorageFile();
  }
  
  private ensureStorageFile(): void {
    if (!fs.existsSync(this.storagePath)) {
        fs.writeFileSync(this.storagePath, JSON.stringify([]));
        
        // Set file permissions to 600 (owner read/write only)
        if (process.platform !== 'win32') {
        fs.chmodSync(this.storagePath, 0o600);
        }
    }
    }

  // Encrypt sensitive auth data before saving
  private encryptAuth(auth?: Auth): any {
    if (!auth) return undefined;

    const encrypted = { ...auth };
    
    if (auth.type === 'basic' && auth.basic) {
      encrypted.basic = {
        username: auth.basic.username,
        password: SecureStorage.encryptToBase64(auth.basic.password)
      };
    } else if (auth.type === 'bearer' && auth.bearer) {
      encrypted.bearer = {
        token: SecureStorage.encryptToBase64(auth.bearer.token)
      };
    } else if (auth.type === 'api-key' && auth.apiKey) {
      encrypted.apiKey = {
        ...auth.apiKey,
        value: SecureStorage.encryptToBase64(auth.apiKey.value)
      };
    }
    
    return encrypted;
  }

  // Decrypt sensitive auth data after loading
  private decryptAuth(auth?: any): Auth | undefined {
    if (!auth) return undefined;

    const decrypted = { ...auth };
    
    try {
      if (auth.type === 'basic' && auth.basic) {
        decrypted.basic = {
          username: auth.basic.username,
          password: SecureStorage.decryptFromBase64(auth.basic.password)
        };
      } else if (auth.type === 'bearer' && auth.bearer) {
        decrypted.bearer = {
          token: SecureStorage.decryptFromBase64(auth.bearer.token)
        };
      } else if (auth.type === 'api-key' && auth.apiKey) {
        decrypted.apiKey = {
          ...auth.apiKey,
          value: SecureStorage.decryptFromBase64(auth.apiKey.value)
        };
      }
    } catch (error) {
      console.error('Failed to decrypt auth data:', error);
    }
    
    return decrypted;
  }

  // Encrypt a project before saving
  private encryptProject(project: Project): any {
    const encrypted = { ...project };
    
    // Encrypt all request auth data
    encrypted.requests = project.requests.map(req => ({
      ...req,
      auth: this.encryptAuth(req.auth)
    }));
    
    // Encrypt requests in folders recursively
    const encryptFolders = (folders: any[]): any[] => {
      return folders.map(folder => ({
        ...folder,
        requests: folder.requests.map((req: any) => ({
          ...req,
          auth: this.encryptAuth(req.auth)
        })),
        subfolders: encryptFolders(folder.subfolders)
      }));
    };
    
    encrypted.folders = encryptFolders(project.folders);
    
    // Encrypt sensitive variables
    encrypted.variables = project.variables.map(v => ({
      ...v,
      value: v.sensitive ? SecureStorage.encryptToBase64(v.value) : v.value
    }));
    
    return encrypted;
  }

  // Decrypt a project after loading
  private decryptProject(project: any): Project {
    const decrypted = { ...project };
    
    // Decrypt all request auth data
    decrypted.requests = project.requests.map((req: any) => ({
      ...req,
      auth: this.decryptAuth(req.auth)
    }));
    
    // Decrypt requests in folders recursively
    const decryptFolders = (folders: any[]): any[] => {
      return folders.map(folder => ({
        ...folder,
        requests: folder.requests.map((req: any) => ({
          ...req,
          auth: this.decryptAuth(req.auth)
        })),
        subfolders: decryptFolders(folder.subfolders)
      }));
    };
    
    decrypted.folders = decryptFolders(project.folders);
    
    // Decrypt sensitive variables
    decrypted.variables = project.variables.map((v: any) => ({
      ...v,
      value: v.sensitive ? SecureStorage.decryptFromBase64(v.value) : v.value
    }));
    
    return decrypted;
  }
  
  loadAll(): Project[] {
    try {
      const data = fs.readFileSync(this.storagePath, 'utf-8');
      const projects = JSON.parse(data);
      return projects.map((p: any) => this.decryptProject(p));
    } catch {
      return [];
    }
  }
  
  save(project: Project): void {
    const projects = this.loadAll();
    const index = projects.findIndex(p => p.id === project.id);
    
    const updatedProject = { ...project, updatedAt: Date.now() };
    
    if (index >= 0) {
      projects[index] = updatedProject;
    } else {
      projects.push(updatedProject);
    }
    
    // Encrypt before saving
    const encryptedProjects = projects.map(p => this.encryptProject(p));
    
    fs.writeFileSync(this.storagePath, JSON.stringify(encryptedProjects, null, 2));
  }
  
  delete(id: string): void {
    const projects = this.loadAll().filter(p => p.id !== id);
    const encryptedProjects = projects.map(p => this.encryptProject(p));
    fs.writeFileSync(this.storagePath, JSON.stringify(encryptedProjects, null, 2));
  }
  
  get(id: string): Project | null {
    const projects = this.loadAll();
    return projects.find(p => p.id === id) || null;
  }
}