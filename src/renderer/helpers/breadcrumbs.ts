import { Project, Folder } from '../../shared/types';
import { findFolder } from './project-manager';

export interface BreadcrumbItem {
  id: string;
  name: string;
  type: 'project' | 'folder';
}

export function getBreadcrumbs(
  project: Project | null,
  folderId?: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  if (!project) {
    return breadcrumbs;
  }
  
  breadcrumbs.push({
    id: project.id,
    name: project.name,
    type: 'project'
  });
  
  if (folderId) {
    const folder = findFolder(project.folders, folderId);
    if (folder) {
      // Build path from root to this folder
      const path = getFolderPath(project.folders, folderId);
      path.forEach(f => {
        breadcrumbs.push({
          id: f.id,
          name: f.name,
          type: 'folder'
        });
      });
    }
  }
  
  return breadcrumbs;
}

function getFolderPath(folders: Folder[], targetId: string, currentPath: Folder[] = []): Folder[] {
  for (const folder of folders) {
    if (folder.id === targetId) {
      return [...currentPath, folder];
    }
    
    const found = getFolderPath(folder.subfolders, targetId, [...currentPath, folder]);
    if (found.length > 0 && found[found.length - 1].id === targetId) {
      return found;
    }
  }
  
  return [];
}

export function renderBreadcrumbs(
  container: HTMLElement,
  breadcrumbs: BreadcrumbItem[]
): void {
  container.innerHTML = '';
  
  if (breadcrumbs.length === 0) {
    container.innerHTML = '<span class="text-gray-500 text-sm">No Project</span>';
    return;
  }
  
  breadcrumbs.forEach((item, index) => {
    const breadcrumb = document.createElement('span');
    breadcrumb.className = 'text-sm';
    
    if (index > 0) {
      const separator = document.createElement('span');
      separator.className = 'text-gray-500 mx-2';
      separator.textContent = '/';
      container.appendChild(separator);
    }
    
    breadcrumb.textContent = item.name;
    breadcrumb.className = index === breadcrumbs.length - 1 
      ? 'text-white text-sm font-semibold' 
      : 'text-blue-400 text-sm cursor-pointer hover:underline';
    
    container.appendChild(breadcrumb);
  });
}