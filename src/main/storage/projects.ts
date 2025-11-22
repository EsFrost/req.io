import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Project } from '../../shared/types';

export class ProjectStorage {
  private storagePath: string;
  
  constructor() {
    const userDataPath = app.getPath('userData');
    this.storagePath = path.join(userDataPath, 'projects.json');
    this.ensureStorageFile();
  }
  
  private ensureStorageFile(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.writeFileSync(this.storagePath, JSON.stringify([]));
    }
  }
  
  loadAll(): Project[] {
    try {
      const data = fs.readFileSync(this.storagePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  
  save(project: Project): void {
    const projects = this.loadAll();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = { ...project, updatedAt: Date.now() };
    } else {
      projects.push(project);
    }
    
    fs.writeFileSync(this.storagePath, JSON.stringify(projects, null, 2));
  }
  
  delete(id: string): void {
    const projects = this.loadAll().filter(p => p.id !== id);
    fs.writeFileSync(this.storagePath, JSON.stringify(projects, null, 2));
  }
  
  get(id: string): Project | null {
    const projects = this.loadAll();
    return projects.find(p => p.id === id) || null;
  }
}