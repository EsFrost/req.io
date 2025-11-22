import { Request, Project } from '../../shared/types';
import { findFolder, addRequestToProject } from './project-manager';

export interface RequestContext {
  request: Request;
  projectId?: string;
  folderId?: string;
  isInProject: boolean;
}

export function getRequestContext(request: Request): RequestContext {
  return {
    request,
    projectId: request.projectId,
    folderId: request.folderId,
    isInProject: !!request.projectId
  };
}

export function saveRequestToProject(
  request: Request,
  project: Project,
  folderId?: string
): void {
  // Remove request from old location if it exists
  if (request.folderId) {
    const oldFolder = findFolder(project.folders, request.folderId);
    if (oldFolder) {
      oldFolder.requests = oldFolder.requests.filter(r => r.id !== request.id);
    }
  } else {
    project.requests = project.requests.filter(r => r.id !== request.id);
  }
  
  // Update request context
  request.projectId = project.id;
  request.folderId = folderId;
  
  // Add to new location
  addRequestToProject(project, request, folderId);
}

export function updateRequestInProject(
  request: Request,
  project: Project
): void {
  if (request.folderId) {
    const folder = findFolder(project.folders, request.folderId);
    if (folder) {
      const index = folder.requests.findIndex(r => r.id === request.id);
      if (index >= 0) {
        folder.requests[index] = request;
      }
    }
  } else {
    const index = project.requests.findIndex(r => r.id === request.id);
    if (index >= 0) {
      project.requests[index] = request;
    }
  }
}