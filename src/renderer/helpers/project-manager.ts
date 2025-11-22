import { Project, Folder, Request } from '../../shared/types';

export function findFolder(folders: Folder[], folderId: string): Folder | null {
  for (const folder of folders) {
    if (folder.id === folderId) return folder;
    const found = findFolder(folder.subfolders, folderId);
    if (found) return found;
  }
  return null;
}

export function deleteFolder(project: Project, folderId: string): void {
  const removeFolder = (folders: Folder[]): Folder[] => {
    return folders.filter(f => {
      if (f.id === folderId) return false;
      f.subfolders = removeFolder(f.subfolders);
      return true;
    });
  };
  
  project.folders = removeFolder(project.folders);
}

export function deleteRequest(project: Project, requestId: string): void {
  project.requests = project.requests.filter(r => r.id !== requestId);
  
  const removeFromFolders = (folders: Folder[]) => {
    folders.forEach(folder => {
      folder.requests = folder.requests.filter(r => r.id !== requestId);
      removeFromFolders(folder.subfolders);
    });
  };
  
  removeFromFolders(project.folders);
}

export function createFolder(
  name: string,
  projectId: string,
  parentId?: string
): Folder {
  return {
    id: Date.now().toString(),
    name,
    parentId,
    projectId,
    requests: [],
    subfolders: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function createRequest(projectId: string, folderId?: string): Request {
  return {
    id: Date.now().toString(),
    name: 'Untitled Request',
    method: 'GET',
    url: '',
    headers: [],
    queryParams: [],
    projectId,
    folderId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function addFolderToProject(
  project: Project,
  folder: Folder,
  parentId?: string
): void {
  if (parentId) {
    const parentFolder = findFolder(project.folders, parentId);
    if (parentFolder) {
      parentFolder.subfolders.push(folder);
    }
  } else {
    project.folders.push(folder);
  }
}

export function addRequestToProject(
  project: Project,
  request: Request,
  folderId?: string
): void {
  if (folderId) {
    const folder = findFolder(project.folders, folderId);
    if (folder) {
      folder.requests.push(request);
    }
  } else {
    project.requests.push(request);
  }
}