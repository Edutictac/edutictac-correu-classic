# Fitxa per a la Chrome Web Store

Material per a omplir el panell de desenvolupador
(https://chrome.google.com/webstore/devconsole). Paquet: `dist/edutictac-correu-classic-vX.Y.Z.zip`.

## Fitxa de la botiga

- **Categoria:** Productivitat › Eines
- **Idioma principal:** català (la fitxa en castellà s'afig com a idioma addicional)
- **Icona:** `icons/icon128.png` (ja va dins del paquet)
- **Captures (1280×800):** `store/screenshot-clar-1280x800.png`, `store/screenshot-fosc-1280x800.png`
- **Tessel·la promocional petita (440×280):** `store/promo-440x280.png`
- **Lloc web:** https://edutictac.es/
- **Assistència:** https://edutictac.es/

### Descripció (català)

Dona a Outlook web l'aspecte d'un client de correu d'escriptori clàssic, amb menys soroll visual i les accions de sempre a la vista.

Pensada per al professorat i el personal de centres educatius que treballen amb Outlook en el navegador i troben a faltar una interfície més sòbria.

Què fa:
• Barra d'eines unificada a dalt: Rep, Redacta, Llibreta d'adreces, Calendari i Filtre ràpid.
• Barra d'accions del missatge: Respon, Respon a tots, Reenvia, Arxiva, Brossa i Suprimeix.
• Colors sobris, files compactes i, si es vol, files alternes a la llista.
• Tema clar, fosc o automàtic (segueix el tema d'Outlook).
• Opció per a amagar la cinta d'Outlook.
• Diagnòstic integrat per a saber què troba la pell en la pàgina.

Privacitat: l'extensió no llig, no envia ni guarda el contingut del correu. Només desa les seues preferències en l'emmagatzematge del navegador. No té servidor propi ni analítica.

Projecte de la Comunitat EduTicTac, programari lliure. No està afiliada ni avalada per Microsoft; Outlook és una marca de Microsoft Corporation.

### Descripción (castellano)

Da a Outlook web el aspecto de un cliente de correo de escritorio clásico, con menos ruido visual y las acciones de siempre a la vista.

Pensada para el profesorado y el personal de centros educativos que trabajan con Outlook en el navegador y echan de menos una interfaz más sobria.

Qué hace:
• Barra de herramientas unificada arriba: Recibir, Redactar, Libreta de direcciones, Calendario y Filtro rápido.
• Barra de acciones del mensaje: Responder, Responder a todos, Reenviar, Archivar, No deseado y Eliminar.
• Colores sobrios, filas compactas y, si se quiere, filas alternas en la lista.
• Tema claro, oscuro o automático (sigue el tema de Outlook).
• Opción para ocultar la cinta de Outlook.
• Diagnóstico integrado para saber qué encuentra la piel en la página.

Privacidad: la extensión no lee, no envía ni guarda el contenido del correo. Solo guarda sus preferencias en el almacenamiento del navegador. No tiene servidor propio ni analítica.

Proyecto de la Comunitat EduTicTac, software libre. No está afiliada ni avalada por Microsoft; Outlook es una marca de Microsoft Corporation.

## Pràctiques de privacitat (pestanya «Privacy»)

- **Propòsit únic:** canviar l'aspecte d'Outlook web perquè semble un client de correu d'escriptori clàssic i afegir-hi barres d'eines amb les accions habituals.
- **Justificació de `storage`:** desar les preferències de l'usuari (activat, tema, files alternes, barres d'eines, amagar la cinta) i sincronitzar-les entre els seus navegadors.
- **Justificació dels permisos de host (scripts de contingut en outlook.office.com, outlook.office365.com, outlook.live.com i outlook.cloud.microsoft):** la pell CSS i les barres d'eines s'han d'injectar en les pàgines d'Outlook web; no s'executa en cap altre lloc.
- **Codi remot:** No. Tot el codi va dins del paquet.
- **Dades recollides:** cap. No marcar cap categoria.
- **Certificacions:** marcar les tres (no es venen dades a tercers, no s'usen per a fins aliens al propòsit únic, no s'usen per a solvència creditícia).
- **URL de la política de privacitat:** https://github.com/Edutictac/edutictac-correu-classic/blob/main/PRIVACY.md

## Distribució

- **Visibilitat:** Pública, o «No llistada» si només es vol repartir l'enllaç als centres.
- **Regions:** totes.

---

# Fitxa per a Firefox (addons.mozilla.org)

Panell: https://addons.mozilla.org/developers/addon/submit/distribution
Paquet: el mateix zip (`dist/edutictac-correu-classic-vX.Y.Z.zip`, des de v0.3.7). El manifest ja porta l'id `correu-classic@edutictac.es` i `data_collection_permissions: none`.

- **Distribució:** «En aquest lloc» (llistada a AMO).
- **Codi font:** «No». El codi no està minificat ni transpilat; no cal pujar-lo.
- **Categoria (Firefox):** Aparença. Secundària: Eines socials i de comunicació.
- **Llicència:** MIT.
- **Política de privadesa:** sí, enganxar el text de `PRIVACY.md`.
- **Pàgina d'inici:** https://edutictac.es/
- **URL d'assistència:** https://github.com/Edutictac/edutictac-correu-classic/issues
- **Captures:** les mateixes de Chrome (`store/screenshot-*.png`).
- **Etiquetes:** outlook, email, theme, education

### Resum (català, ≤ 250 caràcters)

Dona a Outlook web l'aspecte d'un client de correu d'escriptori clàssic: barra d'eines unificada, accions del missatge sempre a la vista, colors sobris i tema clar o fosc. No llig ni envia el teu correu.

### Resumen (castellano, ≤ 250 caracteres)

Da a Outlook web el aspecto de un cliente de correo de escritorio clásico: barra de herramientas unificada, acciones del mensaje siempre a la vista, colores sobrios y tema claro u oscuro. No lee ni envía tu correo.

### Descripció

La mateixa que per a Chrome (dalt). En AMO es pot usar un HTML bàsic; les vinyetes «•» es poden deixar tal qual.

### Notes per al revisor (en anglés)

Pure CSS/JS skin for Outlook on the web. No build step, no minification, no remote code, no network requests. Content scripts only run on the four Outlook web hosts listed in the manifest. The only permission is `storage`, used to keep the user's preferences (enabled, theme, alternate rows, toolbars, hide ribbon). Testing requires a Microsoft 365 or Outlook.com account; the popup's «Diagnòstic» button shows which Outlook elements the skin found.
