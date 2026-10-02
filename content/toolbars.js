// EduTicTac Correu Clàssic — barres d'eines clàssiques.
// Barra unificada a la capçalera (Rep, Redacta, Llibreta, Calendari, Filtre)
// i barra d'accions del missatge al panell de lectura. Les icones són
// pròpies, de traç, a 16 px.
(() => {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // Camins SVG sobre una quadrícula de 16×16, traç de 1,5.
  const ICONS = {
    getMessages: 'M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 11v2.5h11V11',
    write: 'M10.5 2.5l3 3L6 13H3v-3zM9 4l3 3',
    addressBook: 'M3.5 2h9v12h-9zM1.5 4.5h2M1.5 8h2M1.5 11.5h2M8 5.5a1.6 1.6 0 1 0 0 .01M5.5 11c.4-1.5 1.3-2.3 2.5-2.3s2.1.8 2.5 2.3',
    calendar: 'M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 2v3M10.5 2v3',
    quickFilter: 'M2 3h12l-4.5 5.5V13l-3-1.5v-3z',
    reply: 'M6.5 4 2.5 8l4 4M3 8h6.5A4 4 0 0 1 13.5 12v1',
    replyAll: 'M8.5 4l-4 4 4 4M5 8h4.5A4 4 0 0 1 13.5 12v1M5 4 1 8l4 4',
    forward: 'M9.5 4l4 4-4 4M13 8H6.5A4 4 0 0 0 2.5 12v1',
    archive: 'M2 3h12v3H2zM3 6v7.5h10V6M6.5 8.5h3',
    junk: 'M8 1.5c.5 2.5 3.5 3.5 3.5 7a3.5 3.5 0 0 1-7 0c0-1.5.8-2.5 1.5-3 .2 1 .8 1.5 1.3 1.6C7.5 5.5 7.4 3.5 8 1.5z',
    delete: 'M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4M6.5 6.5v5M9.5 6.5v5'
  };

  const MAIN = ['getMessages', 'write', 'addressBook', 'calendar', 'quickFilter'];
  const MESSAGE = ['reply', 'replyAll', 'forward', 'archive', 'junk', 'delete'];

  const LABEL_KEYS = {
    getMessages: 'tbGetMessages',
    write: 'tbWrite',
    addressBook: 'tbAddressBook',
    calendar: 'tbCalendar',
    quickFilter: 'tbQuickFilter',
    reply: 'tbReply',
    replyAll: 'tbReplyAll',
    forward: 'tbForward',
    archive: 'tbArchive',
    junk: 'tbJunk',
    delete: 'tbDelete'
  };

  function icon(name) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', ICONS[name]);
    svg.append(path);
    return svg;
  }

  function button(name) {
    const label = chrome.i18n.getMessage(LABEL_KEYS[name]) || name;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `ett-btn ett-btn-${name}`;
    btn.title = label;
    btn.append(icon(name));
    const text = document.createElement('span');
    text.textContent = label;
    btn.append(text);
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!globalThis.ettActions.run(name)) {
        toast(chrome.i18n.getMessage('tbNotFound', [label]) || label);
      }
    });
    return btn;
  }

  function bar(className, names, ariaKey) {
    const el = document.createElement('div');
    el.className = className;
    el.setAttribute('role', 'toolbar');
    el.setAttribute('aria-label', chrome.i18n.getMessage(ariaKey) || 'EduTicTac');
    for (const name of names) el.append(button(name));
    return el;
  }

  let toastTimer = null;
  function toast(message) {
    let el = document.querySelector('.ett-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'ett-toast';
      el.setAttribute('role', 'status');
      document.body.append(el);
    }
    el.textContent = message;
    el.classList.add('ett-toast-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('ett-toast-visible'), 3500);
  }

  // Barra unificada: just després de la marca a la capçalera.
  function ensureMainBar() {
    if (document.querySelector('.ett-toolbar')) return;
    const brand = document.querySelector('.ett-brand');
    if (!brand) return;
    brand.after(bar('ett-toolbar', MAIN, 'tbMainLabel'));
  }

  // Barra del missatge: a dalt del panell de lectura, només si hi ha un
  // missatge obert (un encapçalament dins del panell).
  function ensureMessageBar() {
    const pane = document.querySelector('div#ReadingPaneContainerId, div[data-automation-id="readingPaneContainer"]');
    const existing = document.querySelector('.ett-msgbar');
    if (!pane || !pane.querySelector('[role="heading"]')) {
      existing?.remove();
      return;
    }
    if (existing && pane.contains(existing)) return;
    existing?.remove();
    pane.prepend(bar('ett-msgbar', MESSAGE, 'tbMessageLabel'));
  }

  function ensure(enabled) {
    if (!enabled) {
      remove();
      return;
    }
    ensureMainBar();
    ensureMessageBar();
  }

  function remove() {
    document.querySelectorAll('.ett-toolbar, .ett-msgbar, .ett-toast').forEach((el) => el.remove());
  }

  globalThis.ettToolbars = { ensure, remove };
})();
