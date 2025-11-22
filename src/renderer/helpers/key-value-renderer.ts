import { KeyValue } from '../../shared/types';

export function createKeyValueRow(
  key: string = '',
  value: string = '',
  enabled: boolean = true,
  onDelete: () => void,
  onChange?: () => void,
  sensitive: boolean = false, // NEW parameter
  showSensitiveToggle: boolean = false // NEW parameter
): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'flex gap-2 items-center mb-2';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = enabled;
  checkbox.className = 'w-5 h-5';
  if (onChange) {
    checkbox.addEventListener('change', onChange);
  }
  
  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.value = key;
  keyInput.placeholder = 'Key';
  keyInput.className = 'flex-1 bg-gray-800 text-white p-2 rounded border border-gray-700';
  if (onChange) {
    keyInput.addEventListener('input', onChange);
  }
  
  const valueInput = document.createElement('input');
  valueInput.type = sensitive ? 'password' : 'text';
  valueInput.value = value;
  valueInput.placeholder = 'Value';
  valueInput.className = 'flex-1 bg-gray-800 text-white p-2 rounded border border-gray-700';
  if (onChange) {
    valueInput.addEventListener('input', onChange);
  }
  
  // Add sensitive toggle if needed
  if (showSensitiveToggle) {
    const sensitiveBtn = document.createElement('button');
    sensitiveBtn.type = 'button';
    sensitiveBtn.className = sensitive 
      ? 'bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-xl'
      : 'bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-xl';
    sensitiveBtn.textContent = '🔒';
    sensitiveBtn.title = 'Mark as sensitive (encrypted storage)';
    sensitiveBtn.onclick = () => {
      const newSensitive = !sensitive;
      sensitiveBtn.className = newSensitive
        ? 'bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-xl'
        : 'bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-xl';
      valueInput.type = newSensitive ? 'password' : 'text';
      if (onChange) onChange();
    };
    row.appendChild(sensitiveBtn);
  }
  
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '×';
  deleteBtn.className = 'bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-xl font-bold';
  deleteBtn.onclick = onDelete;
  
  row.appendChild(checkbox);
  row.appendChild(keyInput);
  row.appendChild(valueInput);
  row.appendChild(deleteBtn);
  
  return row;
}

export function renderKeyValueList(
  container: HTMLDivElement,
  items: KeyValue[],
  onUpdate: () => void
): void {
  container.innerHTML = '';
  items.forEach((item, index) => {
    const row = createKeyValueRow(item.key, item.value, item.enabled, () => {
      items.splice(index, 1);
      renderKeyValueList(container, items, onUpdate);
      onUpdate();
    }, onUpdate);
    container.appendChild(row);
  });
}

export function addKeyValue(
  items: KeyValue[],
  container: HTMLDivElement,
  onUpdate: () => void
): void {
  items.push({ key: '', value: '', enabled: true });
  renderKeyValueList(container, items, onUpdate);
}