import hljs from 'highlight.js';
import { FetchResponse } from '../shared/types';

declare global {
  interface Window {
    electron: {
      fetchUrl: (url: string) => Promise<FetchResponse>;
    };
  }
}

type DisplayFormat = 'raw' | 'json' | 'html' | 'xml';

const fetchButton = document.getElementById('fetch') as HTMLButtonElement;
const urlInput = document.getElementById('url') as HTMLInputElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;
const formatSelect = document.getElementById('format-select') as HTMLSelectElement;
const statusCodeSpan = document.getElementById('status-code') as HTMLSpanElement;

let currentFormat: DisplayFormat = 'raw';
let lastResponse: string = '';

const detectLanguage = (data: string): string => {
  const trimmed = data.trim();
  
  // Check for JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }
  
  // Check for XML
  if (trimmed.startsWith('<?xml') || 
      (trimmed.startsWith('<') && trimmed.includes('</') && trimmed.endsWith('>'))) {
    return 'xml';
  }
  
  // Check for HTML
  if (trimmed.toLowerCase().includes('<!doctype html') || 
      trimmed.toLowerCase().includes('<html')) {
    return 'html';
  }
  
  return 'plaintext';
};

const displayResponse = (data: string) => {
  lastResponse = data;
  resultDiv.innerHTML = '';
  
  const codeBlock = document.createElement('pre');
  const codeElement = document.createElement('code');
  
  switch (currentFormat) {
    case 'raw':
      // Auto-detect language for syntax highlighting
      const detectedLang = detectLanguage(data);
      codeElement.className = `language-${detectedLang}`;
      codeElement.textContent = data;
      codeBlock.appendChild(codeElement);
      resultDiv.appendChild(codeBlock);
      hljs.highlightElement(codeElement);
      break;
      
    case 'json':
      try {
        const parsed = JSON.parse(data);
        const formatted = JSON.stringify(parsed, null, 2);
        codeElement.className = 'language-json';
        codeElement.textContent = formatted;
        codeBlock.appendChild(codeElement);
        resultDiv.appendChild(codeBlock);
        hljs.highlightElement(codeElement);
      } catch {
        codeElement.className = 'language-plaintext';
        codeElement.textContent = 'Invalid JSON: ' + data;
        codeBlock.appendChild(codeElement);
        resultDiv.appendChild(codeBlock);
        hljs.highlightElement(codeElement);
      }
      break;
      
    case 'html':
      codeElement.className = 'language-html';
      codeElement.textContent = data;
      codeBlock.appendChild(codeElement);
      resultDiv.appendChild(codeBlock);
      hljs.highlightElement(codeElement);
      break;
      
    case 'xml':
      codeElement.className = 'language-xml';
      codeElement.textContent = data;
      codeBlock.appendChild(codeElement);
      resultDiv.appendChild(codeBlock);
      hljs.highlightElement(codeElement);
      break;
  }
};

formatSelect?.addEventListener('change', () => {
  currentFormat = formatSelect.value as DisplayFormat;
  if (lastResponse) {
    displayResponse(lastResponse);
  }
});

fetchButton?.addEventListener('click', async () => {
  try {
    const response = await window.electron.fetchUrl(urlInput.value);
    if (response.success) {
      // Show status code (200 for successful curl response)
      statusCodeSpan.textContent = '200 OK';
      statusCodeSpan.className = 'text-green-400 font-semibold';
      displayResponse(response.data || '');
    } else {
      // Show error status
      statusCodeSpan.textContent = 'Error';
      statusCodeSpan.className = 'text-red-400 font-semibold';
      resultDiv.textContent = `Error: ${response.error}`;
    }
  } catch (error) {
    console.error(error);
    statusCodeSpan.textContent = 'Error';
    statusCodeSpan.className = 'text-red-400 font-semibold';
    resultDiv.textContent = 'An error occurred';
  }
});