import { Request, HttpMethod, KeyValue, BodyType, AuthType } from '../../shared/types';

export const methodColors: Record<HttpMethod, string> = {
  'GET': 'text-green-600',
  'POST': 'text-yellow-600',
  'PUT': 'text-blue-600',
  'PATCH': 'text-pink-600',
  'DELETE': 'text-red-600',
  'HEAD': 'text-green-400',
  'OPTIONS': 'text-purple-600'
};

export function isHttpMethod(method: string): method is HttpMethod {
  return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(method);
}

export function buildRequest(
  currentMethod: HttpMethod,
  urlInput: HTMLInputElement,
  paramsContainer: HTMLDivElement,
  headersContainer: HTMLDivElement,
  bodyTypeSelect: HTMLSelectElement,
  bodyRawTextarea: HTMLTextAreaElement,
  bodyJsonTextarea: HTMLTextAreaElement,
  bodyFormDataContainer: HTMLDivElement,
  authTypeSelect: HTMLSelectElement,
  projectId?: string
): Request {
  // Get query params from inputs
  const paramRows = paramsContainer.querySelectorAll('.flex');
  const currentParams: KeyValue[] = [];
  paramRows.forEach(row => {
    const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const keyInput = row.querySelector('[data-key-input]') as HTMLInputElement;
    const valueInput = row.querySelector('[data-value-input]') as HTMLInputElement;
    
    if (checkbox && keyInput && valueInput) {
      currentParams.push({
        key: keyInput.value,
        value: valueInput.value,
        enabled: checkbox.checked
      });
    }
  });
  
  // Get headers from inputs
  const headerRows = headersContainer.querySelectorAll('.flex');
  const currentHeaders: KeyValue[] = [];
  headerRows.forEach(row => {
    const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const keyInput = row.querySelector('[data-key-input]') as HTMLInputElement;
    const valueInput = row.querySelector('[data-value-input]') as HTMLInputElement;
    
    if (checkbox && keyInput && valueInput) {
      currentHeaders.push({
        key: keyInput.value,
        value: valueInput.value,
        enabled: checkbox.checked
      });
    }
  });
  
  // Build body
  const bodyType = bodyTypeSelect.value as BodyType;
  let body: Request['body'];
  
  if (bodyType === 'none') {
    body = undefined;
  } else if (bodyType === 'raw' || bodyType === 'x-www-form-urlencoded') {
    body = { type: bodyType, raw: bodyRawTextarea.value };
  } else if (bodyType === 'json') {
    body = { type: bodyType, json: bodyJsonTextarea.value };
  } else if (bodyType === 'form-data') {
    const formRows = bodyFormDataContainer.querySelectorAll('.flex');
    const formData: KeyValue[] = [];
    formRows.forEach(row => {
      const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
      const keyInput = row.querySelector('[data-key-input]') as HTMLInputElement;
      const valueInput = row.querySelector('[data-value-input]') as HTMLInputElement;
      
      if (checkbox && keyInput && valueInput) {
        formData.push({
          key: keyInput.value,
          value: valueInput.value,
          enabled: checkbox.checked
        });
      }
    });
    body = { type: bodyType, formData };
  }
  
  // Build auth
  const authType = authTypeSelect.value as AuthType;
  let auth: Request['auth'];
  
  if (authType === 'none') {
    auth = undefined;
  } else if (authType === 'basic') {
    const username = (document.getElementById('auth-basic-username') as HTMLInputElement).value;
    const password = (document.getElementById('auth-basic-password') as HTMLInputElement).value;
    auth = { type: authType, basic: { username, password } };
  } else if (authType === 'bearer') {
    const token = (document.getElementById('auth-bearer-token') as HTMLInputElement).value;
    auth = { type: authType, bearer: { token } };
  } else if (authType === 'api-key') {
    const key = (document.getElementById('auth-apikey-key') as HTMLInputElement).value;
    const value = (document.getElementById('auth-apikey-value') as HTMLInputElement).value;
    const addTo = (document.getElementById('auth-apikey-addto') as HTMLSelectElement).value as 'header' | 'query';
    auth = { type: authType, apiKey: { key, value, addTo } };
  }
  
  return {
    id: Date.now().toString(),
    name: 'Untitled Request',
    method: currentMethod,
    url: urlInput.value,
    headers: currentHeaders,
    body,
    auth,
    queryParams: currentParams,
    projectId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}