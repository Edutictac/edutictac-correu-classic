// EduTicTac Correu Clàssic — accions de les barres d'eines.
// Cada acció no implementa res: busca el botó real d'Outlook i el prem.
// Estratègies, per ordre: data-automation-id, etiqueta exacta (aria-label,
// title o text) en valencià/català, castellà i anglés, i com a últim recurs
// la drecera de teclat d'Outlook o una URL.
(() => {
  'use strict';

  const OWN = '.ett-toolbar, .ett-msgbar, .ett-brand, .ett-toast';

  // Etiquetes en minúscules. «exact» ha de coincidir sencera; «prefix» val
  // si l'etiqueta comença així (Outlook afig a vegades «(Ctrl+R)» o similars).
  const ACTIONS = {
    getMessages: {
      run: () => clickSelectedFolder()
    },
    write: {
      ids: ['newMessage', 'newMail', 'splitbuttonprimary'],
      exact: ['correu nou', 'missatge nou', 'nou missatge', 'nou correu electrònic', 'correu electrònic nou', 'correo nuevo', 'nuevo correo', 'mensaje nuevo', 'nuevo mensaje', 'nuevo correo electrónico', 'correo electrónico nuevo', 'new mail', 'new message', 'new email'],
      prefix: ['correu nou', 'nou correu', 'missatge nou', 'correo nuevo', 'nuevo correo', 'mensaje nuevo', 'nuevo mensaje', 'new mail', 'new email', 'new message'],
      key: { key: 'n', code: 'KeyN' }
    },
    addressBook: {
      scope: '#LeftRail, div[data-automation-id="leftRail"], nav',
      exact: ['persones', 'contactes', 'personas', 'contactos', 'people', 'contacts'],
      url: '/people/'
    },
    calendar: {
      scope: '#LeftRail, div[data-automation-id="leftRail"], nav',
      exact: ['calendari', 'calendario', 'calendar'],
      url: '/calendar/'
    },
    quickFilter: {
      exact: ['filtre', 'filtra', 'filtrar', 'filtro', 'filter'],
      prefix: ['filtre', 'filtrar', 'filtro', 'filter']
    },
    reply: {
      ids: ['reply'],
      exact: ['respon', 'respondre', 'responder', 'reply'],
      key: { key: 'r', code: 'KeyR' }
    },
    replyAll: {
      ids: ['replyAll'],
      exact: ['respon a tots', 'respondre a tots', 'responder a todos', 'reply all', 'reply to all'],
      key: { key: 'R', code: 'KeyR', shiftKey: true }
    },
    forward: {
      ids: ['forward'],
      exact: ['reenvia', 'reenviar', 'forward'],
      key: { key: 'F', code: 'KeyF', shiftKey: true }
    },
    archive: {
      ids: ['archive'],
      exact: ['arxiva', 'arxivar', 'archivar', 'archive'],
      key: { key: 'e', code: 'KeyE' }
    },
    junk: {
      ids: ['junk', 'reportJunk'],
      exact: ['brossa', 'correu brossa', 'informa', 'notifica', 'correo no deseado', 'no deseado', 'informar', 'notificar', 'junk', 'report', 'report junk'],
      prefix: ['informa', 'notifica', 'report']
    },
    delete: {
      ids: ['delete'],
      exact: ['suprimeix', 'suprimir', 'elimina', 'eliminar', 'delete'],
      key: { key: 'Delete', code: 'Delete' }
    }
  };

  function labelOf(el) {
    return (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '')
      .replace(/\s*\(.*?\)\s*$/, '')   // «Respon (Ctrl+R)» → «Respon»
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function isUsable(el) {
    if (el.closest(OWN)) return false;
    if (el.getAttribute('aria-disabled') === 'true' || el.disabled) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function candidates(scope) {
    const roots = scope ? [...document.querySelectorAll(scope)] : [document];
    const selector = 'button, [role="button"], [role="menuitem"], a[role="link"], [role="tab"]';
    return roots.flatMap((r) => [...r.querySelectorAll(selector)]).filter(isUsable);
  }

  // Botons del panell de lectura primer: Respon/Reenvia hi apareixen dues
  // voltes (cinta i capçalera del missatge) i el del missatge és el fiable.
  function byPriority(list) {
    const pane = document.querySelector('#ReadingPaneContainerId, div[data-automation-id="readingPaneContainer"]');
    if (!pane) return list;
    return [...list.filter((el) => pane.contains(el)), ...list.filter((el) => !pane.contains(el))];
  }

  function findButton(def) {
    for (const id of def.ids || []) {
      const el = [...document.querySelectorAll(`[data-automation-id="${id}"]`)].find(isUsable);
      if (el) return { el, via: `data-automation-id=${id}` };
    }
    const list = byPriority(candidates(def.scope));
    const exact = list.find((el) => (def.exact || []).includes(labelOf(el)));
    if (exact) return { el: exact, via: `etiqueta «${labelOf(exact)}»` };
    const prefixed = list.find((el) => (def.prefix || []).some((p) => labelOf(el).startsWith(p)));
    if (prefixed) return { el: prefixed, via: `prefix «${labelOf(prefixed)}»` };
    return null;
  }

  function clickSelectedFolder() {
    const folder = document.querySelector('div[role="tree"] [role="treeitem"][aria-selected="true"]');
    if (!folder) return false;
    folder.click();
    return true;
  }

  // Les dreceres d'Outlook escolten keydown al document; cal que el focus
  // estiga a la llista i no en un camp de text.
  function sendShortcut(key) {
    const target = document.querySelector('div[role="listbox"] [role="option"][aria-selected="true"]')
      || document.querySelector('div[role="listbox"]')
      || document.body;
    const init = { bubbles: true, cancelable: true, composed: true, ...key };
    target.dispatchEvent(new KeyboardEvent('keydown', init));
    target.dispatchEvent(new KeyboardEvent('keyup', init));
    return true;
  }

  function run(name) {
    const def = ACTIONS[name];
    if (!def) return false;
    if (def.run) return def.run();
    const hit = findButton(def);
    if (hit) {
      hit.el.click();
      return true;
    }
    if (def.key) return sendShortcut(def.key);
    if (def.url) {
      location.assign(new URL(def.url, location.origin).href);
      return true;
    }
    return false;
  }

  // Per al diagnòstic: com es resoldria cada acció ara mateix.
  function resolveAll() {
    const out = {};
    for (const [name, def] of Object.entries(ACTIONS)) {
      if (def.run) { out[name] = 'pròpia'; continue; }
      const hit = findButton(def);
      out[name] = hit ? hit.via : def.key ? 'drecera de teclat' : def.url ? 'URL' : 'NO TROBADA';
    }
    return out;
  }

  globalThis.ettActions = { run, resolveAll };
})();
