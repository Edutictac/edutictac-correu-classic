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
    return outlookTheme() || (darkQuery.matches ? 'dark' : 'light');
  }

  // Tema propi d'Outlook (Configuració › General › Aparença). «Automàtic»
  // el segueix: si la pell fosca va sobre un Outlook clar, es barregen.
  // Llegim un token de Fluent que la pell no toca: el fons invertit és clar
  // quan Outlook és fosc.
  function outlookTheme() {
    const provider = document.querySelector('.fui-FluentProvider');
    if (!provider) return null;
    const value = getComputedStyle(provider).getPropertyValue('--colorNeutralBackgroundInverted').trim();
    const hex = value.match(/^#([0-9a-f]{6})$/i);
    if (!hex) return null;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16));
    return 0.299 * r + 0.587 * g + 0.114 * b > 128 ? 'dark' : 'light';
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
    followOutlookTheme();
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
  // Els botons de la dreta (Teams, Mi día, campana, configuració) també
  // porten el blau de fons; només deixem intactes el cercador i les imatges.
  const HEADER_KEEP = '.ett-toolbar, .ett-brand, div[role="search"], #searchBoxId, #topSearchInput, img, [role="img"]';
  let lastFlatten = 0;

  function flattenHeader() {
    if (!config.enabled || performance.now() - lastFlatten < 2000) return;
    const header = document.querySelector('.ett-header');
    if (!header) return;
    lastFlatten = performance.now();
    for (const el of header.querySelectorAll('*')) {
      if (el.closest('.ett-toolbar, .ett-brand')) continue;
      if (ownText(el) === 'Outlook') {
        el.classList.add('ett-gone');
        continue;
      }
      if (el.classList.contains('ett-flat') || el.closest(HEADER_KEEP)) continue;
      const style = getComputedStyle(el);
      const painted = (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent')
        || style.backgroundImage !== 'none';
      if (painted) el.classList.add('ett-flat');
    }
  }

  // Només el text directe de l'element, no el dels fills.
  function ownText(el) {
    return [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('').trim();
  }

  // Per al diagnòstic: què pinta fons dins de la barra i on és el nom.
  function headerPaint() {
    const header = document.querySelector('.ett-header');
    if (!header) return undefined;
    const out = [];
    for (const el of [header, ...header.querySelectorAll('*')]) {
      if (el.closest('.ett-toolbar, .ett-brand')) continue;
      const style = getComputedStyle(el);
      const bg = style.backgroundImage !== 'none' ? 'img' : style.backgroundColor;
      const named = ownText(el) === 'Outlook';
      if (!named && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) continue;
      const cls = typeof el.className === 'string' ? el.className.split(' ').filter((c) => c.startsWith('ett-')).join('.') : '';
      out.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls : ''} ${bg}${named ? ' «Outlook»' : ''}`);
      if (out.length >= 15) break;
    }
    return out;
  }

  // Si el tema és automàtic i Outlook canvia de tema, la pell el segueix.
  let lastThemeCheck = 0;

  function followOutlookTheme() {
    if (!config.enabled || config.theme !== 'auto' || performance.now() - lastThemeCheck < 2000) return;
    lastThemeCheck = performance.now();
    const theme = resolveTheme();
    if (root.getAttribute('data-ett-theme') !== theme) root.setAttribute('data-ett-theme', theme);
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
      outlookTheme: outlookTheme() || 'desconegut',
      headerPaint: headerPaint(),
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
