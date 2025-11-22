import { Project } from '../../shared/types';

export interface ProjectCallbacks {
  onLoadProject: (projectId: string) => void;
  onEditProject: (project: Project) => void;
  onExportProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export function renderProjectList(
  container: HTMLDivElement,
  projects: Project[],
  callbacks: ProjectCallbacks
): void {
  container.innerHTML = '';
  
  if (projects.length === 0) {
    container.innerHTML = '<div class="text-gray-400 text-center py-8">No projects yet. Create one to get started!</div>';
    return;
  }
  
  projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'bg-gray-800 p-4 rounded mb-3 hover:bg-gray-750 cursor-pointer';
    
    projectCard.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-white mb-1">${project.name}</h3>
          ${project.description ? `<p class="text-sm text-gray-400 mb-2">${project.description}</p>` : ''}
          ${project.baseUrl ? `<p class="text-xs text-blue-400">Base URL: ${project.baseUrl}</p>` : ''}
        </div>
        <div class="flex gap-2">
          <button class="edit-project bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">Edit</button>
          <button class="export-project bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">Export</button>
          <button class="delete-project bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">Delete</button>
        </div>
      </div>
      <div class="text-xs text-gray-500">
        ${project.folders.length} folder(s), ${project.requests.length} request(s)
      </div>
    `;
    
    projectCard.onclick = (e) => {
      if (!(e.target as HTMLElement).classList.contains('edit-project') && 
          !(e.target as HTMLElement).classList.contains('delete-project') &&
          !(e.target as HTMLElement).classList.contains('export-project')) {
        callbacks.onLoadProject(project.id);
      }
    };
    
    projectCard.querySelector('.edit-project')?.addEventListener('click', (e) => {
      e.stopPropagation();
      callbacks.onEditProject(project);
    });
    
    projectCard.querySelector('.export-project')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      callbacks.onExportProject(project);
    });
    
    projectCard.querySelector('.delete-project')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      callbacks.onDeleteProject(project.id);
    });
    
    container.appendChild(projectCard);
  });
}