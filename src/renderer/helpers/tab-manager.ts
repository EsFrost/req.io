import { Request, HttpResponse, HttpMethod } from '../../shared/types';

export interface Tab {
  id: string;
  name: string;
  request: Request;
  response: HttpResponse | null;
}

export class TabManager {
  private tabs: Tab[] = [];
  private activeTabId: string = '';
  private tabsContainer: HTMLDivElement;
  private onTabChange: (tabId: string) => void;

  constructor(tabsContainer: HTMLDivElement, onTabChange: (tabId: string) => void) {
    this.tabsContainer = tabsContainer;
    this.onTabChange = onTabChange;
  }

  createTab(request: Request): string {
    const tab: Tab = {
      id: Date.now().toString(),
      name: 'New Request',
      request,
      response: null
    };
    
    this.tabs.push(tab);
    this.activeTabId = tab.id;
    this.render();
    return tab.id;
  }

  closeTab(tabId: string): void {
    if (this.tabs.length === 1) return;
    
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;
    
    this.tabs.splice(index, 1);
    
    if (this.activeTabId === tabId) {
      this.activeTabId = this.tabs[Math.max(0, index - 1)].id;
    }
    
    this.render();
    this.onTabChange(this.activeTabId);
  }

  setActiveTab(tabId: string): void {
    this.activeTabId = tabId;
    this.render();
    this.onTabChange(tabId);
  }

  getActiveTab(): Tab | null {
    return this.tabs.find(t => t.id === this.activeTabId) || null;
  }

  updateActiveTab(request: Request, response: HttpResponse | null): void {
    const tab = this.getActiveTab();
    if (!tab) return;
    
    tab.request = request;
    tab.response = response;
    
    // Update tab name based on URL
    if (request.url) {
      try {
        const url = new URL(request.url);
        const urlPath = url.pathname.split('/').filter(p => p).join('/') || url.hostname;
        tab.name = `${request.method} ${urlPath.substring(0, 20)}${urlPath.length > 20 ? '...' : ''}`;
      } catch {
        tab.name = `${request.method} Request`;
      }
    } else {
      tab.name = 'New Request';
    }
    
    this.render();
  }

  getTabs(): Tab[] {
    return this.tabs;
  }

  getActiveTabId(): string {
    return this.activeTabId;
  }

  private render(): void {
    this.tabsContainer.innerHTML = '';
    
    this.tabs.forEach(tab => {
      const tabElement = document.createElement('div');
      tabElement.className = `flex items-center gap-2 px-4 py-2 rounded-t cursor-pointer transition-all duration-300 ${
        this.activeTabId === tab.id ? 'bg-[rgba(7,14,29,0.7)] text-white hover:bg-[rgba(7,14,29,0.9)]' : 'bg-gray-700 text-gray-400 hover:bg-[rgba(7,14,29,0.9)]'
      }`;
      
      const tabName = document.createElement('span');
      tabName.textContent = tab.name;
      tabName.className = 'text-sm';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.className = 'text-lg hover:text-red-400 ml-2';
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.closeTab(tab.id);
      };
      
      tabElement.onclick = () => {
        this.setActiveTab(tab.id);
      };
      
      tabElement.appendChild(tabName);
      if (this.tabs.length > 1) {
        tabElement.appendChild(closeBtn);
      }
      
      this.tabsContainer.appendChild(tabElement);
    });
  }
}