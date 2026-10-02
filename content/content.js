// EduTicTac Correu Clàssic — script de contingut.
// Posa classes a <html> segons la configuració, injecta la marca i les
// barres d'eines (toolbars.js) i respon al diagnòstic del popup.
// L'aspecte és tot CSS.
(() => {
  'use strict';

  const DEFAULTS = { enabled: true, theme: 'auto', zebra: false, toolbars: true, hideRibbon: false };
  const root = document.documentElement;
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  let config = { ...DEFAULTS };

  // Ancoratges que fa servir theme.css. El diagnòstic diu quins troba,
  // per a saber què cal ajustar quan Microsoft canvia l'estructura.
  const ANCHORS = {
    header: '#O365_NavHeader, #o365header, div[role="banner"]',
    search: '#topSearchInput, div[role="search"], #searchBoxId',
    leftRail: '#LeftRail, div[data-automation-id="leftRail"]',
    toolbar: 'div[role="toolbar"]:not(.ett-toolbar):not(.ett-msgbar)',
    ribbon: '#RibbonRoot, div[data-automation-id="ribbon"], div[role="region"][aria-label="Ribbon" i], div[role="region"][aria-label*="cinta" i]',
    folderTree: 'div[role="tree"], #folderPane, div[data-automation-id="folderPane"]',
    messageList: 'div#MailList, div#MessageList, div[data-automation-id="messageListContainer"], div[role="listbox"]',
    messageRow: 'div[role="listbox"] [role="option"]',
    columnHeader: '[role="columnheader"]',
    readingPane: 'div#ReadingPaneContainerId, div[data-automation-id="readingPaneContainer"]',
    fluentProvider: '.fui-FluentProvider'
  };

  function resolveTheme() {
    if (config.theme === 'light' || config.theme === 'dark') return config.theme;
    return darkQuery.matches ? 'dark' : 'light';
  }

  function apply() {
    root.classList.toggle('ett-classic', config.enabled);
    root.classList.toggle('ett-zebra', config.enabled && config.zebra);
    root.classList.toggle('ett-hide-ribbon', config.enabled && config.toolbars && config.hideRibbon);
    if (config.enabled) {
      root.setAttribute('data-ett-theme', resolveTheme());
    } else {
      root.removeAttribute('data-ett-theme');
    }
    refresh();
  }

  function refresh() {
    ensureBrand();
    flattenHeader();
    globalThis.ettToolbars.ensure(config.enabled && config.toolbars);
  }

  // --- Marca a la barra superior -------------------------------------------

  const HEADER_SELECTOR = '#O365_NavHeader, #o365header, div[role="banner"], header[role="banner"], body header';

  // La barra superior. Si Outlook no fa servir cap identificador conegut,
  // pugem des del cercador fins al primer contenidor ample i baix que
  // estiga dalt de tot de la finestra: eixa és la barra.
  function findHeader() {
    const marked = document.querySelector('.ett-header');
    if (marked && marked.isConnected) return { el: marked, via: marked.dataset.ettVia };
    let el = document.querySelector(HEADER_SELECTOR);
    let via = 'selector';
    if (!el) {
      el = headerFromSearch();
      via = 'cercador';
    }
    if (!el) return null;
    el.classList.add('ett-header');
    el.dataset.ettVia = via;
    return { el, via };
  }

  function headerFromSearch() {
    const search = document.querySelector(ANCHORS.search);
    for (let el = search?.parentElement; el && el !== document.body; el = el.parentElement) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= 4 && rect.height > 0 && rect.height <= 80 && rect.width >= window.innerWidth * 0.9) return el;
    }
    return null;
  }

  // Per al diagnòstic: els avantpassats del cercador amb la seua mida.
  function searchAncestry() {
    const out = [];
    let el = document.querySelector(ANCHORS.search);
    for (let depth = 0; el && el !== document.body && depth < 10; depth++, el = el.parentElement) {
      const rect = el.getBoundingClientRect();
      const id = el.id ? '#' + el.id : '';
      const role = el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : '';
      const auto = el.dataset.automationId ? `[aid=${el.dataset.automationId}]` : '';
      out.push(`${el.tagName.toLowerCase()}${id}${role}${auto} ${Math.round(rect.width)}×${Math.round(rect.height)}@${Math.round(rect.top)}`);
    }
    return out;
  }

  function findHeaderSlot() {
    const header = findHeader()?.el;
    if (!header) return null;
    // La zona esquerra on Outlook posa el seu nom d'app, si existeix
    return header.querySelector('#O365_HeaderLeftRegion') || header.firstElementChild || header;
  }

  function ensureBrand() {
    if (!config.enabled || document.querySelector('.ett-brand')) return;
    const slot = findHeaderSlot();
    if (!slot) return;

    const brand = document.createElement('a');
    brand.className = 'ett-brand';
    brand.href = 'https://edutictac.es/';
    brand.target = '_blank';
    brand.rel = 'noopener';
    brand.title = 'Comunitat EduTicTac';

    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('assets/mark.png');
    img.alt = '';

    const name = document.createElement('b');
    name.textContent = 'EduTicTac';
    const label = document.createElement('span');
    label.textContent = chrome.i18n.getMessage('brandLabel') || 'Correu';

    brand.append(img, name, label);
    slot.prepend(brand);
  }

  // La barra d'Outlook pinta trossos amb el blau de Microsoft (la zona dels
  // botons de la dreta) i hi deixa el nom «Outlook». No sabem les classes,
  // així que marquem els contenidors amb fons propi i amaguem el nom.
  // Com a molt una volta cada dos segons: Outlook muta molt.
  const HEADER_KEEP = '.ett-toolbar, .ett-brand, div[role="search"], #searchBoxId, #topSearchInput, button, [role="button"], a, img, [role="img"]';
  let lastFlatten = 0;

  function flattenHeader() {
    if (!config.enabled || performance.now() - lastFlatten < 2000) return;
    const header = document.querySelector('.ett-header');
    if (!header) return;
    lastFlatten = performance.now();
    for (const el of header.querySelectorAll('div, span')) {
      if (el.closest('.ett-toolbar, .ett-brand')) continue;
      if (el.childElementCount === 0 && el.textContent.trim() === 'Outlook') {
        el.classList.add('ett-gone');
        continue;
      }
      if (el.classList.contains('ett-flat') || el.closest(HEADER_KEEP)) continue;
      const bg = getComputedStyle(el).backgroundColor;
      if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') el.classList.add('ett-flat');
    }
  }

  // Outlook carrega la barra tard i de vegades la redibuixa: tornem a posar
  // la marca si desapareix. Només mirem si falta, no recorrem l'arbre.
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending || !config.enabled) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      refresh();
    });
  });

  // --- Diagnòstic ----------------------------------------------------------

  function diagnose() {
    const found = {};
    for (const [key, selector] of Object.entries(ANCHORS)) {
      found[key] = document.querySelectorAll(selector).length;
    }
    return {
      url: location.host + location.pathname,
      enabled: config.enabled,
      theme: resolveTheme(),
      config,
      brand: Boolean(document.querySelector('.ett-brand')),
      header: findHeader()?.via || 'NO TROBADA',
      searchAncestry: document.querySelector('.ett-brand') ? undefined : searchAncestry(),
      toolbars: {
        main: Boolean(document.querySelector('.ett-toolbar')),
        message: Boolean(document.querySelector('.ett-msgbar'))
      },
      found,
      actions: globalThis.ettActions.resolveAll(),
      buttons: globalThis.ettActions.inventory()
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'ett-diagnose') sendResponse(diagnose());
  });

  // --- Arrencada -----------------------------------------------------------

  // Aplicació optimista amb els valors per defecte per a evitar el parpelleig
  // de l'Outlook original mentre es llig la configuració.
  apply();

  chrome.storage.sync.get(DEFAULTS, (stored) => {
    config = { ...DEFAULTS, ...stored };
    apply();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key in DEFAULTS) config[key] = newValue;
    }
    apply();
  });

  darkQuery.addEventListener('change', () => {
    if (config.enabled && config.theme === 'auto') apply();
  });

  // A document_start encara no hi ha <body>: observem <html>.
  observer.observe(root, { childList: true, subtree: true });
})();
