'use strict';

const DEFAULTS = { enabled: true, theme: 'auto', zebra: false, toolbars: true, hideRibbon: false };

for (const el of document.querySelectorAll('[data-i18n]')) {
  const text = chrome.i18n.getMessage(el.dataset.i18n);
  if (text) el.textContent = text;
}
document.documentElement.lang = chrome.i18n.getUILanguage().split('-')[0];
document.getElementById('version').textContent = 'v' + chrome.runtime.getManifest().version;

const checkboxes = ['enabled', 'zebra', 'toolbars', 'hideRibbon'].map((id) => document.getElementById(id));
const themeInputs = document.querySelectorAll('input[name="theme"]');

chrome.storage.sync.get(DEFAULTS, (config) => {
  for (const box of checkboxes) box.checked = config[box.id];
  syncDependent();
  for (const input of themeInputs) input.checked = input.value === config.theme;
});

// «Amaga la cinta» només té sentit amb les barres pròpies actives
function syncDependent() {
  const hideRibbon = document.getElementById('hideRibbon');
  hideRibbon.disabled = !document.getElementById('toolbars').checked;
}

for (const box of checkboxes) {
  box.addEventListener('change', () => {
    chrome.storage.sync.set({ [box.id]: box.checked });
    syncDependent();
  });
}
for (const input of themeInputs) {
  input.addEventListener('change', () => chrome.storage.sync.set({ theme: input.value }));
}

document.getElementById('diagnose').addEventListener('toggle', async (event) => {
  if (!event.target.open) return;
  const output = document.getElementById('diagnose-output');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const report = await chrome.tabs.sendMessage(tab.id, { type: 'ett-diagnose' });
    output.textContent = JSON.stringify(report, null, 2);
  } catch {
    output.textContent = chrome.i18n.getMessage('popupNoOutlook');
  }
});
