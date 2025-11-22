import { Request, HttpMethod } from '../../shared/types';
import { isHttpMethod } from './request-builder';

export function loadRequestIntoUI(
  request: Request,
  elements: {
    urlInput: HTMLInputElement;
    paramsContainer: HTMLDivElement;
    headersContainer: HTMLDivElement;
    bodyTypeSelect: HTMLSelectElement;
    bodyRawTextarea: HTMLTextAreaElement;
    bodyJsonTextarea: HTMLTextAreaElement;
    bodyFormDataContainer: HTMLDivElement;
    authTypeSelect: HTMLSelectElement;
  },
  renderers: {
    renderParams: () => void;
    renderHeaders: () => void;
    renderFormFields: () => void;
  },
  setters: {
    setMethod: (method: HttpMethod) => void;
    setQueryParams: (params: any[]) => void;
    setHeaders: (headers: any[]) => void;
    setFormFields: (fields: any[]) => void;
  }
): void {
  // Populate URL
  elements.urlInput.value = request.url || '';
  
  // Set method
  if (request.method && isHttpMethod(request.method)) {
    setters.setMethod(request.method);
  }
  
  // Populate query params
  setters.setQueryParams(request.queryParams || []);
  renderers.renderParams();
  
  // Populate headers
  setters.setHeaders(request.headers || []);
  renderers.renderHeaders();
  
  // Populate body
  if (request.body) {
    elements.bodyTypeSelect.value = request.body.type;
    elements.bodyTypeSelect.dispatchEvent(new Event('change'));
    
    switch (request.body.type) {
      case 'raw':
      case 'x-www-form-urlencoded':
        elements.bodyRawTextarea.value = request.body.raw || '';
        break;
      case 'json':
        elements.bodyJsonTextarea.value = typeof request.body.json === 'string' 
          ? request.body.json 
          : JSON.stringify(request.body.json, null, 2);
        break;
      case 'form-data':
        setters.setFormFields(request.body.formData || []);
        renderers.renderFormFields();
        break;
    }
  } else {
    elements.bodyTypeSelect.value = 'none';
    elements.bodyTypeSelect.dispatchEvent(new Event('change'));
  }
  
  // Populate auth
  if (request.auth) {
    elements.authTypeSelect.value = request.auth.type;
    elements.authTypeSelect.dispatchEvent(new Event('change'));
    
    switch (request.auth.type) {
      case 'basic':
        if (request.auth.basic) {
          (document.getElementById('auth-basic-username') as HTMLInputElement).value = request.auth.basic.username || '';
          (document.getElementById('auth-basic-password') as HTMLInputElement).value = request.auth.basic.password || '';
        }
        break;
      case 'bearer':
        if (request.auth.bearer) {
          (document.getElementById('auth-bearer-token') as HTMLInputElement).value = request.auth.bearer.token || '';
        }
        break;
      case 'api-key':
        if (request.auth.apiKey) {
          (document.getElementById('auth-apikey-key') as HTMLInputElement).value = request.auth.apiKey.key || '';
          (document.getElementById('auth-apikey-value') as HTMLInputElement).value = request.auth.apiKey.value || '';
          (document.getElementById('auth-apikey-addto') as HTMLSelectElement).value = request.auth.apiKey.addTo || 'header';
        }
        break;
    }
  } else {
    elements.authTypeSelect.value = 'none';
    elements.authTypeSelect.dispatchEvent(new Event('change'));
  }
}