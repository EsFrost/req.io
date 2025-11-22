import { Folder } from '../../shared/types';

export function renderFolderTree(
  container: HTMLElement,
  folders: Folder[],
  onSelect: (folderId: string) => void,
  depth: number = 0
): void {
  folders.forEach(folder => {
    const folderBtn = document.createElement('button');
    folderBtn.className = 'w-full bg-gray-800 hover:bg-gray-700 p-2 rounded mb-1 text-left flex items-center gap-2';
    folderBtn.style.marginLeft = `${depth * 20}px`;
    
    const icon = document.createElement('span');
    icon.textContent = '📁';
    
    const name = document.createElement('span');
    name.textContent = folder.name;
    name.className = 'text-sm';
    
    folderBtn.appendChild(icon);
    folderBtn.appendChild(name);
    
    folderBtn.onclick = () => onSelect(folder.id);
    
    container.appendChild(folderBtn);
    
    // Render subfolders
    if (folder.subfolders.length > 0) {
      renderFolderTree(container, folder.subfolders, onSelect, depth + 1);
    }
  });
}