import { Project, Folder, Request } from '../../shared/types';
import { methodColors } from './request-builder';

export interface SidebarCallbacks {
  onNewFolder: () => void;
  onNewRequest: () => void;
  onAddRequestToFolder: (folderId: string) => void;
  onAddSubfolder: (parentId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onDeleteRequest: (requestId: string) => void;
  onLoadRequest: (request: Request) => void;
}

export function renderSidebar(
  container: HTMLDivElement,
  project: Project | null,
  callbacks: SidebarCallbacks,
  activeRequestId?: string
): void {
  container.innerHTML = '';
  
  if (!project) {
    container.innerHTML = '<div class="text-gray-400 text-center py-4 text-sm">Select a project to view its contents</div>';
    return;
  }
  
  // Add New Folder Button
  const newFolderBtn = document.createElement('button');
  newFolderBtn.className = "w-full px-3 py-2 mb-4 text-sm overflow-hidden border border-gray-400 rounded-md px-4 py-2 text-lg cursor-pointer relative bg-[rgba(17,24,39,0.3)] backdrop-blur-xs shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_5px_2.5px_rgba(255,255,255,0.25)] transition-all duration-500 ease-in-out hover:backdrop-blur-md hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_10px_5px_rgba(255,255,255,0.5)] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-[50%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:skew-x-[-25deg] before:transition-all before:duration-500 before:ease-in-out hover:before:left-[150%] active:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_15px_7.5px_rgba(255,255,255,0.75)] active:duration-10";
  newFolderBtn.textContent = '+ New Folder';
  newFolderBtn.onclick = callbacks.onNewFolder;
  container.appendChild(newFolderBtn);
  
  // Add New Request Button
  const newRequestBtn = document.createElement('button');
  newRequestBtn.className = "w-full px-3 py-2 mb-4 text-sm overflow-hidden border border-gray-400 rounded-md px-4 py-2 text-lg cursor-pointer relative bg-[rgba(17,24,39,0.3)] backdrop-blur-xs shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_5px_2.5px_rgba(255,255,255,0.25)] transition-all duration-500 ease-in-out hover:backdrop-blur-md hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_10px_5px_rgba(255,255,255,0.5)] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-[50%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:skew-x-[-25deg] before:transition-all before:duration-500 before:ease-in-out hover:before:left-[150%] active:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_15px_7.5px_rgba(255,255,255,0.75)] active:duration-10";
  newRequestBtn.textContent = '+ New Request';
  newRequestBtn.onclick = callbacks.onNewRequest;
  container.appendChild(newRequestBtn);
  
  // Render folders
  project.folders.forEach(folder => {
    renderFolder(folder, container, 0, callbacks, activeRequestId);
  });
  
  // Render root requests
  project.requests.forEach(request => {
    renderRequest(request, container, 0, callbacks, activeRequestId);
  });
}

function renderFolder(
  folder: Folder,
  container: HTMLElement,
  depth: number,
  callbacks: SidebarCallbacks,
  activeRequestId?: string
): void {
  const folderDiv = document.createElement('div');
  folderDiv.className = 'mb-2';
  folderDiv.style.marginLeft = `${depth * 20}px`;
  
  const folderHeader = document.createElement('div');
  folderHeader.className = 'flex items-center justify-between bg-gray-800 p-2 rounded cursor-pointer hover:bg-gray-750';
  
  const folderName = document.createElement('div');
  folderName.className = 'flex items-center gap-2';
  folderName.innerHTML = `<span><svg class="w-5 h-5 inline-block mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 8.2C3 7.07989 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H9.67452C10.1637 5 10.4083 5 10.6385 5.05526C10.8425 5.10425 11.0376 5.18506 11.2166 5.29472C11.4184 5.4184 11.5914 5.59135 11.9373 5.93726L12.0627 6.06274C12.4086 6.40865 12.5816 6.5816 12.7834 6.70528C12.9624 6.81494 13.1575 6.89575 13.3615 6.94474C13.5917 7 13.8363 7 14.3255 7H17.8C18.9201 7 19.4802 7 19.908 7.21799C20.2843 7.40973 20.5903 7.71569 20.782 8.09202C21 8.51984 21 9.0799 21 10.2V15.8C21 16.9201 21 17.4802 20.782 17.908C20.5903 18.2843 20.2843 18.5903 19.908 18.782C19.4802 19 18.9201 19 17.8 19H6.2C5.07989 19 4.51984 19 4.09202 18.782C3.71569 18.5903 3.40973 18.2843 3.21799 17.908C3 17.4802 3 16.9201 3 15.8V8.2Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></span><span class="text-sm">${folder.name}</span>`;
  
  const folderActions = document.createElement('div');
  folderActions.className = 'flex gap-1';
  
  const addRequestBtn = document.createElement('button');
  addRequestBtn.textContent = '+';
  addRequestBtn.className = `px-2 py-1 text-xs overflow-hidden border border-gray-400 rounded-md cursor-pointer relative
                bg-[rgba(17,24,39,0.3)]
                backdrop-blur-xs
                shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_5px_2.5px_rgba(255,255,255,0.25)]
                transition-all duration-500 ease-in-out
                hover:backdrop-blur-md
                hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_10px_5px_rgba(255,255,255,0.5)]
                before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-[50%] before:h-full
                before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent
                before:skew-x-[-25deg]
                before:transition-all before:duration-500 before:ease-in-out
                hover:before:left-[150%]
                active:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_15px_7.5px_rgba(255,255,255,0.75)]
                active:duration-10`;
  addRequestBtn.onclick = (e) => {
    e.stopPropagation();
    callbacks.onAddRequestToFolder(folder.id);
  };
  
  const addSubfolderBtn = document.createElement('button');
  addSubfolderBtn.innerHTML = `<svg class="w-4 h-4 inline-block mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.672"></g><g id="SVGRepo_iconCarrier"> <path d="M9 13H15M12 10V16M12.0627 6.06274L11.9373 5.93726C11.5914 5.59135 11.4184 5.4184 11.2166 5.29472C11.0376 5.18506 10.8425 5.10425 10.6385 5.05526C10.4083 5 10.1637 5 9.67452 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V10.2C21 9.0799 21 8.51984 20.782 8.09202C20.5903 7.71569 20.2843 7.40973 19.908 7.21799C19.4802 7 18.9201 7 17.8 7H14.3255C13.8363 7 13.5917 7 13.3615 6.94474C13.1575 6.89575 12.9624 6.81494 12.7834 6.70528C12.5816 6.5816 12.4086 6.40865 12.0627 6.06274Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
  addSubfolderBtn.className = `px-2 py-1 overflow-hidden border border-gray-400 rounded-md cursor-pointer relative
                bg-[rgba(17,24,39,0.3)]
                backdrop-blur-xs
                shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_5px_2.5px_rgba(255,255,255,0.25)]
                transition-all duration-500 ease-in-out
                hover:backdrop-blur-md
                hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_10px_5px_rgba(255,255,255,0.5)]
                before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-[50%] before:h-full
                before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent
                before:skew-x-[-25deg]
                before:transition-all before:duration-500 before:ease-in-out
                hover:before:left-[150%]
                active:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_15px_7.5px_rgba(255,255,255,0.75)]
                active:duration-10`;
  addSubfolderBtn.onclick = (e) => {
    e.stopPropagation();
    callbacks.onAddSubfolder(folder.id);
  };
  
  const deleteFolderBtn = document.createElement('button');
  deleteFolderBtn.textContent = '×';
  deleteFolderBtn.className = `px-2 py-1 text-xs overflow-hidden border border-gray-400 rounded-md cursor-pointer relative
                bg-[rgba(17,24,39,0.3)]
                backdrop-blur-xs
                shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_5px_2.5px_rgba(255,255,255,0.25)]
                transition-all duration-500 ease-in-out
                hover:backdrop-blur-md
                hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_10px_5px_rgba(255,255,255,0.5)]
                before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-[50%] before:h-full
                before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent
                before:skew-x-[-25deg]
                before:transition-all before:duration-500 before:ease-in-out
                hover:before:left-[150%]
                active:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_15px_7.5px_rgba(255,255,255,0.75)]
                active:duration-10`;
  deleteFolderBtn.onclick = (e) => {
    e.stopPropagation();
    callbacks.onDeleteFolder(folder.id);
  };
  
  folderActions.appendChild(addRequestBtn);
  folderActions.appendChild(addSubfolderBtn);
  folderActions.appendChild(deleteFolderBtn);
  
  folderHeader.appendChild(folderName);
  folderHeader.appendChild(folderActions);
  folderDiv.appendChild(folderHeader);
  
  const folderContent = document.createElement('div');
  folderContent.className = 'ml-4 mt-1';
  
  folder.subfolders.forEach(subfolder => {
    renderFolder(subfolder, folderContent, depth + 1, callbacks, activeRequestId);
  });
  
  folder.requests.forEach(request => {
    renderRequest(request, folderContent, depth + 1, callbacks, activeRequestId);
  });
  
  folderDiv.appendChild(folderContent);
  container.appendChild(folderDiv);
}

function renderRequest(
  request: Request,
  container: HTMLElement,
  depth: number,
  callbacks: SidebarCallbacks,
  activeRequestId?: string
): void {
  const isActive = activeRequestId === request.id;
  
  const requestDiv = document.createElement('div');
  requestDiv.className = `p-2 rounded mb-1 cursor-pointer flex items-center justify-between ${
    isActive ? 'bg-gray-700 border border-gray-500' : 'bg-gray-800 hover:bg-gray-750'
  }`;
  requestDiv.style.marginLeft = `${depth * 20}px`;
  
  const methodColor = methodColors[request.method] || 'text-gray-400';
  
  const requestInfo = document.createElement('div');
  requestInfo.className = 'flex items-center gap-2 flex-1';
  requestInfo.innerHTML = `
    <span class="font-semibold ${methodColor} text-xs">${request.method}</span>
    <span class="text-sm ${isActive ? 'text-white font-semibold' : 'text-gray-300'}">${request.name}</span>
  `;
  
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '×';
  deleteBtn.className = `px-2 py-1 text-xs overflow-hidden border border-gray-400 rounded-md text-lg cursor-pointer relative
                bg-[rgba(17,24,39,0.3)]
                backdrop-blur-xs
                shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_5px_2.5px_rgba(255,255,255,0.25)]
                transition-all duration-500 ease-in-out
                hover:backdrop-blur-md
                hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_10px_5px_rgba(255,255,255,0.5)]
                before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-[50%] before:h-full
                before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent
                before:skew-x-[-25deg]
                before:transition-all before:duration-500 before:ease-in-out
                hover:before:left-[150%]
                active:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_15px_7.5px_rgba(255,255,255,0.75)]
                active:duration-10`;
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    callbacks.onDeleteRequest(request.id);
  };
  
  requestDiv.onclick = () => {
    callbacks.onLoadRequest(request);
  };
  
  requestDiv.appendChild(requestInfo);
  requestDiv.appendChild(deleteBtn);
  container.appendChild(requestDiv);
}