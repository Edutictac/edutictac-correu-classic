'use strict';

const DEFAULTS = { enabled: true, theme: 'auto', zebra: false };

for (const el of document.querySelectorAll('[data-i18n]')) {
  const text = chrome.i18n.getMessage(el.dataset.i18n);
  if (text) el.textContent = text;
}
document.documentElement.lang = chrome.i18n.getUILanguage().split('-')[0];
document.getElementById('version').textContent = 'v' + chrome.runtime.getManifest().version;

const enabled = document.getElementById('enabled');
const zebra = document.getElementById('zebra');
const themeInputs = document.querySelectorAll('input[name="theme"]');

chrome.storage.sync.get(DEFAULTS, (config) => {
  enabled.checked = config.enabled;
  zebra.checked = config.zebra;
  for (const input of themeInputs) input.checked = input.value === config.theme;
});

enabled.addEventListener('change', () => chrome.storage.sync.set({ enabled: enabled.checked }));
zebra.addEventListener('change', () => chrome.storage.sync.set({ zebra: zebra.checked }));
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
