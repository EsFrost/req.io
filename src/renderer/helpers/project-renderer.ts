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
    container.innerHTML = '<div class="text-gray-400 text-center py-8 bg-[rgba(7,14,29,0.7)]">No projects yet. Create one to get started!</div>';
    return;
  }
  
  projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'bg-[rgba(7,14,29,0.7)] p-4 rounded mb-3 hover:bg-gray-750 cursor-pointer';
    
    projectCard.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-white mb-1">${project.name}</h3>
          ${project.description ? `<p class="text-sm text-gray-400 mb-2">${project.description}</p>` : ''}
          ${project.baseUrl ? `<p class="text-xs text-blue-400">Base URL: ${project.baseUrl}</p>` : ''}
        </div>
        <div class="flex gap-2">
          <button class="edit-project px-3 py-1 text-sm overflow-hidden border border-gray-400 rounded-md px-4 py-2 text-lg cursor-pointer relative
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
                active:duration-10">Edit</button>
          <button class="export-project px-3 py-1 overflow-hidden border border-gray-400 rounded-md px-4 py-2 text-lg cursor-pointer relative
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
                active:duration-10 text-sm">Export</button>
          <button class="delete-project px-3 py-1 overflow-hidden border border-gray-400 rounded-md px-4 py-2 text-lg cursor-pointer relative
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
                active:duration-10 text-sm">Delete</button>
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