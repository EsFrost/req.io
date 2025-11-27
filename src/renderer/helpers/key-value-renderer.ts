import { KeyValue } from '../../shared/types';

export function createKeyValueRow(
  key: string = '',
  value: string = '',
  enabled: boolean = true,
  onDelete: () => void,
  onChange?: () => void,
  sensitive: boolean = false,
  showSensitiveToggle: boolean = false
): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'flex gap-2 items-center mb-2';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = enabled;
  checkbox.className = 'w-5 h-5 rounded border border-gray-700 accent-[rgb(7,14,29)] cursor-pointer bg-[rgba(7,14,29,1.0)]';
  if (onChange) {
    checkbox.addEventListener('change', onChange);
  }
  
  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.value = key;
  keyInput.placeholder = 'Key';
  keyInput.className = 'flex-1 bg-[rgba(7,14,29,0.7)] text-white p-2 rounded border border-gray-700';
  keyInput.dataset.keyInput = 'true';
  if (onChange) {
    keyInput.addEventListener('input', onChange);
  }
  
  const valueInput = document.createElement('input');
  valueInput.type = sensitive ? 'password' : 'text';
  valueInput.value = value;
  valueInput.placeholder = 'Value';
  valueInput.className = 'flex-1 bg-[rgba(7,14,29,0.7)] text-white p-2 rounded border border-gray-700';
  valueInput.dataset.valueInput = 'true';
  if (onChange) {
    valueInput.addEventListener('input', onChange);
  }
  
  row.appendChild(checkbox);
  row.appendChild(keyInput);
  row.appendChild(valueInput);
  
  // Add sensitive toggle if needed
  if (showSensitiveToggle) {
    const sensitiveBtn = document.createElement('button');
    sensitiveBtn.type = 'button';
    
    // Locked state: same effects but brighter background
    const lockedClass = `px-3 py-3 text-xl rounded-md overflow-hidden relative border border-gray-400 cursor-pointer flex items-center justify-center
                bg-[rgba(17,24,39,0.7)]
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
    
    // Unlocked state: normal background
    const unlockedClass = `px-3 py-3 text-xl rounded-md overflow-hidden relative border border-gray-400 cursor-pointer flex items-center justify-center
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
    
    sensitiveBtn.className = sensitive ? lockedClass : unlockedClass;
    sensitiveBtn.dataset.sensitiveBtn = 'true';
    
    sensitiveBtn.innerHTML = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 14.5V16.5M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
    sensitiveBtn.title = 'Mark as sensitive (encrypted storage)';
    
    let isSensitive = sensitive;
    sensitiveBtn.onclick = () => {
      isSensitive = !isSensitive;
      sensitiveBtn.className = isSensitive ? lockedClass : unlockedClass;
      valueInput.type = isSensitive ? 'password' : 'text';
      sensitiveBtn.dataset.isSensitive = isSensitive.toString();
      if (onChange) onChange();
    };
    sensitiveBtn.dataset.isSensitive = sensitive.toString();
    
    row.appendChild(sensitiveBtn);
  }
  
  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Menu / Close_SM"> <path id="Vector" d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>`;
  deleteBtn.className = "px-2 py-2 text-xl font-bold overflow-hidden border border-gray-400 rounded-md cursor-pointer flex items-center justify-center bg-[rgba(17,24,39,0.3)] backdrop-blur-xs shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_5px_2.5px_rgba(255,255,255,0.25)] transition-all duration-500 ease-in-out hover:backdrop-blur-md hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_10px_5px_rgba(255,255,255,0.5)] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-[50%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:skew-x-[-25deg] before:transition-all before:duration-500 before:ease-in-out hover:before:left-[150%] active:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_15px_7.5px_rgba(255,255,255,0.75)] active:duration-10";
  deleteBtn.onclick = onDelete;
  
  row.appendChild(deleteBtn);
  
  return row;
}

export function syncArrayFromDOM(container: HTMLDivElement, items: KeyValue[]): void {
  const rows = container.querySelectorAll('.flex');
  
  // Clear the array and rebuild from DOM
  items.length = 0;
  
  rows.forEach((row) => {
    const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const keyInput = row.querySelector('[data-key-input]') as HTMLInputElement;
    const valueInput = row.querySelector('[data-value-input]') as HTMLInputElement;
    const sensitiveBtn = row.querySelector('[data-sensitive-btn]') as HTMLButtonElement;
    
    if (checkbox && keyInput && valueInput) {
      items.push({
        key: keyInput.value,
        value: valueInput.value,
        enabled: checkbox.checked,
        sensitive: sensitiveBtn ? sensitiveBtn.dataset.isSensitive === 'true' : false
      });
    }
  });
}

export function renderKeyValueList(
  container: HTMLDivElement,
  items: KeyValue[],
  onUpdate: () => void,
  showSensitiveToggle: boolean = false
): void {
  
  container.innerHTML = '';
  items.forEach((item, index) => {
    const row = createKeyValueRow(
      item.key, 
      item.value, 
      item.enabled, 
      () => {
        items.splice(index, 1);
        renderKeyValueList(container, items, onUpdate, showSensitiveToggle);
        onUpdate();
      }, 
      onUpdate,
      item.sensitive || false,
      showSensitiveToggle
    );
    container.appendChild(row);
  });
}

export function addKeyValue(
  items: KeyValue[],
  container: HTMLDivElement,
  onUpdate: () => void,
  showSensitiveToggle: boolean = false
): void {
  // Sync current DOM values back to array FIRST
  syncArrayFromDOM(container, items);
  
  // Then add new empty item
  items.push({ key: '', value: '', enabled: true });
  
  // Re-render
  renderKeyValueList(container, items, onUpdate, showSensitiveToggle);
}