import { Project } from '../../shared/types';

export function replaceVariables(text: string, project: Project | null): string {
  if (!project) return text;
  
  let result = text;
  
  // Replace {{baseUrl}}
  if (project.baseUrl) {
    result = result.replace(/\{\{baseUrl\}\}/g, project.baseUrl);
  }
  
  // Replace custom variables
  project.variables.forEach(variable => {
    if (variable.enabled && variable.key) {
      const regex = new RegExp(`\\{\\{${variable.key}\\}\\}`, 'g');
      result = result.replace(regex, variable.value || '');
    }
  });
  
  return result;
}