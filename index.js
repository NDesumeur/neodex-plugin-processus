// Processus : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoDex sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoDex.
// Elle tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = "<div class=\"appWrap\">\n      <div class=\"agHead\"><span class=\"label\">Processus</span><span class=\"hint\" id=\"prInfo\"></span></div>\n      <div class=\"row\"><input class=\"f\" id=\"prFilter\" placeholder=\"Filtrer…\" spellcheck=\"false\" style=\"flex:1\"><select class=\"f\" id=\"prSort\" style=\"width:220px\"><option value=\"cpu\">Trier : processeur</option><option value=\"mem\">Trier : mémoire</option><option value=\"name\">Trier : nom</option></select><label class=\"prHide\"><input type=\"checkbox\" id=\"prHideWin\"> Cacher Windows</label></div>\n      <div class=\"sysCard px\" id=\"prPlugCard\" hidden><span class=\"label\">Plugins de NeoDex</span><div class=\"prRow head\"><span></span><span>Plugin</span><span>Processeur</span><span>Mémoire</span><span></span></div><div id=\"prPlugins\"></div></div>\n      <div class=\"sysCard px\"><div class=\"prRow head\"><span></span><span>Programme</span><span>Processeur</span><span>Mémoire</span><span></span></div><div id=\"prList\"></div></div>\n      <div class=\"hint\">« Fermer » force la fermeture, comme « Fin de tâche » dans le Gestionnaire des tâches. Les programmes indispensables à Windows sont protégés.</div>\n    </div>";
/*CSS-MOVED*/ const CSS = `.prRow{display:grid;grid-template-columns:24px 1fr 100px 100px 90px;gap:12px;align-items:center;padding:6px 4px;font-size:15px;border-bottom:1px solid rgba(255,255,255,.05)}
.prRow img{width:20px;height:20px;object-fit:contain}
.prRow .tn{color:#fff;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prRow small{display:block;font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis}
.prRow .v{text-align:right;color:var(--lilac)}
.prRow .v.hot{color:var(--pink)}
.prRow .btn{height:30px;font-size:13px;padding:0 10px}
.prDot{width:10px;height:10px;margin:5px;background:var(--muted)} .prDot.on{background:var(--pink)}
.prRow small.why{white-space:normal;color:var(--lilac);line-height:1.35}
.prTag{display:inline-block;font-size:11px;letter-spacing:1px;padding:0 5px;margin-right:6px;border:1px solid currentColor}
.prTag.win{color:#7aa8e0}.prTag.winok{color:#7ee07a}.prTag.drv{color:#c9a0ff}.prTag.warn{color:#ff8a3a}
.prHide{display:flex;align-items:center;gap:6px;white-space:nowrap;cursor:var(--cp,pointer)}.prHide input{width:18px;height:18px}
.prRow.head{font:7px var(--title);letter-spacing:1px;color:var(--muted)}
.prRow.head span:nth-child(3),.prRow.head span:nth-child(4){text-align:right}
#prList{max-height:62vh;overflow-y:auto}
#prPlugins{max-height:38vh;overflow-y:auto}
`;  // le style de ce plugin (il utilise les variables du thème de NeoDex)
// ce que fait chaque processus courant, en clair. win : de Windows, ne pas fermer ; winok : de Windows, sans danger, il se relance ; drv : un pilote ; app : un programme
const PR_KNOW = {
  svchost: ['win', 'Héberge les services de Windows (réseau, son, mises à jour…). Il y en a beaucoup, c’est normal.'],
  system: ['win', 'Le cœur de Windows (le noyau) : il fait tourner tout le reste.'],
  'system idle process': ['win', 'Le temps où le processeur ne fait rien : plus ce chiffre est haut, plus le PC est au repos.'], idle: ['win', 'Le temps où le processeur ne fait rien.'],
  registry: ['win', 'Le registre de Windows (ses réglages), gardé en mémoire.'], 'memory compression': ['win', 'La mémoire compressée : Windows serre la mémoire peu utilisée au lieu de l’écrire sur le disque. Beaucoup de mémoire ici, c’est normal.'],
  memcompression: ['win', 'La mémoire compressée de Windows.'], 'secure system': ['win', 'Une partie protégée de Windows (sécurité).'],
  smss: ['win', 'Démarre ta session Windows.'], csrss: ['win', 'Gère les fenêtres et les consoles : indispensable.'], wininit: ['win', 'Lance les services au démarrage de Windows.'],
  winlogon: ['win', 'Gère l’ouverture de session et Ctrl + Alt + Suppr.'], services: ['win', 'Le gestionnaire des services de Windows.'],
  lsass: ['win', 'Vérifie les mots de passe et la sécurité de ta session.'], lsaiso: ['win', 'Protège tes identifiants à part du reste.'], fontdrvhost: ['win', 'Affiche les polices de caractères.'],
  dwm: ['win', 'Dessine les fenêtres, la transparence et les animations à l’écran. Un peu de processeur quand l’image bouge, c’est normal.'],
  explorer: ['winok', 'L’Explorateur : la barre des tâches, le bureau et les dossiers. Le fermer fait disparaître la barre des tâches un instant ; il se relance.'],
  sihost: ['win', 'L’interface de Windows (notifications, menus).'], taskhostw: ['win', 'Fait tourner des tâches de Windows en arrière-plan.'],
  runtimebroker: ['win', 'Surveille les autorisations des applis du Microsoft Store.'], backgroundtaskhost: ['win', 'Une tâche de fond d’une appli du Microsoft Store.'],
  applicationframehost: ['win', 'Dessine le cadre des applis du Microsoft Store.'], lockapp: ['win', 'L’écran de verrouillage.'],
  searchhost: ['winok', 'La recherche du menu Démarrer.'], searchapp: ['winok', 'La recherche du menu Démarrer.'], searchui: ['winok', 'La recherche du menu Démarrer.'],
  searchindexer: ['win', 'Range tes fichiers pour que la recherche soit rapide ; il travaille surtout quand le PC ne fait rien.'],
  searchprotocolhost: ['win', 'Aide à ranger les fichiers pour la recherche.'], searchfilterhost: ['win', 'Aide à ranger les fichiers pour la recherche.'],
  startmenuexperiencehost: ['winok', 'Le menu Démarrer.'], shellexperiencehost: ['winok', 'L’horloge, le volume et les notifications de la barre des tâches.'],
  textinputhost: ['winok', 'Le clavier tactile, les emoji (Windows + point) et la saisie.'], ctfmon: ['win', 'La saisie au clavier et les langues.'],
  spoolsv: ['win', 'La file d’impression (imprimantes).'], audiodg: ['win', 'Le son de Windows. Un peu de processeur pendant la musique ou un appel, c’est normal.'],
  conhost: ['win', 'La fenêtre d’une console (invite de commandes ou programme sans fenêtre).'], dllhost: ['win', 'Fait tourner des morceaux de programmes (miniatures d’images…).'],
  wmiprvse: ['win', 'Répond aux programmes qui demandent des informations sur le PC (NeoDex compris).'],
  msmpeng: ['win', 'L’antivirus Microsoft Defender. Il travaille plus pendant une analyse ou une installation.'], nissrv: ['win', 'Defender : surveille le réseau contre les attaques.'],
  mpdefendercoreservice: ['win', 'Microsoft Defender, l’antivirus de Windows.'], securityhealthservice: ['win', 'Sécurité Windows.'], securityhealthsystray: ['winok', 'L’icône de Sécurité Windows.'],
  smartscreen: ['win', 'SmartScreen vérifie les fichiers téléchargés.'], sgrmbroker: ['win', 'Vérifie que Windows n’a pas été modifié au démarrage.'],
  wudfhost: ['drv', 'Fait tourner des pilotes : USB, capteurs, lecteur d’empreintes.'], wsappx: ['win', 'Installe et met à jour les applis du Microsoft Store.'],
  tiworker: ['win', 'Installe les mises à jour de Windows : il travaille beaucoup juste après une mise à jour, puis se calme.'], trustedinstaller: ['win', 'Installe les mises à jour de Windows.'],
  mousocoreworker: ['win', 'Windows Update cherche les mises à jour.'], usocoreworker: ['win', 'Windows Update cherche les mises à jour.'],
  compattelrunner: ['winok', 'Envoie des informations de compatibilité à Microsoft ; il peut être lourd quelques minutes.'], werfault: ['winok', 'Le rapport d’erreur de Windows, après un plantage.'], wermgr: ['winok', 'Le rapport d’erreur de Windows.'],
  vmmem: ['win', 'La mémoire des machines virtuelles (WSL ou Hyper-V).'], vmmemwsl: ['win', 'La mémoire de WSL (Linux dans Windows).'],
  systemsettings: ['winok', 'Les Paramètres de Windows.'], onedrive: ['winok', 'OneDrive synchronise tes fichiers avec le cloud.'],
  widgets: ['winok', 'Les widgets de Windows (météo, actualités).'], widgetservice: ['winok', 'Les widgets de Windows.'], phoneexperiencehost: ['winok', 'Lien avec le mobile.'],
  gamebar: ['winok', 'La Xbox Game Bar (Windows + G).'], gamebarftserver: ['winok', 'La Xbox Game Bar.'], gamingservices: ['winok', 'Les services de jeu Xbox.'],
  nvcontainer: ['drv', 'Les services du pilote NVIDIA (carte graphique).'], 'nvdisplay.container': ['drv', 'Le pilote d’affichage NVIDIA.'], 'nvidia web helper': ['drv', 'NVIDIA : mises à jour du pilote.'], 'nvidia share': ['drv', 'NVIDIA : l’overlay et l’enregistrement.'], 'nvidia overlay': ['drv', 'NVIDIA : l’overlay en jeu.'],
  amdrsserv: ['drv', 'Le logiciel AMD Radeon (carte graphique).'], radeonsoftware: ['drv', 'Le logiciel AMD Radeon.'], atieclxx: ['drv', 'Le pilote AMD.'], atiesrxx: ['drv', 'Le pilote AMD.'],
  igfxem: ['drv', 'Le pilote graphique Intel.'], igfxcuiservice: ['drv', 'Le pilote graphique Intel.'], rtkauduservice64: ['drv', 'Le pilote audio Realtek.'], rtkaudusvc: ['drv', 'Le pilote audio Realtek.'],
  msedge: ['app', 'Microsoft Edge, ou une appli qui s’en sert. Un processus par onglet, c’est normal.'], msedgewebview2: ['app', 'Le moteur d’Edge utilisé par d’autres applis (Teams, widgets…).'],
  chrome: ['app', 'Google Chrome : un processus par onglet et par extension, c’est normal.'], firefox: ['app', 'Mozilla Firefox.'], neodex: ['app', 'NeoDex lui-même : un processus pour la fenêtre, d’autres pour les onglets et les plugins.'],
  electron: ['app', 'Un programme fait avec Electron (comme NeoDex, Discord ou VS Code).'], discord: ['app', 'Discord.'], steam: ['app', 'Steam.'], steamwebhelper: ['app', 'La partie navigateur de Steam (magasin, bibliothèque).'], spotify: ['app', 'Spotify.'], code: ['app', 'Visual Studio Code.'],
  teams: ['app', 'Microsoft Teams.'], 'ms-teams': ['app', 'Microsoft Teams.'], outlook: ['app', 'Outlook.'], winword: ['app', 'Word.'], excel: ['app', 'Excel.'], powerpnt: ['app', 'PowerPoint.'], lghub: ['app', 'Logitech G HUB (souris, clavier, casque).'],
  node: ['app', 'Node.js : un programme en JavaScript (souvent un outil de développement).'], python: ['app', 'Un programme en Python.'], pythonw: ['app', 'Un programme en Python, sans fenêtre.'],
  powershell: ['app', 'Une fenêtre PowerShell (commandes).'], pwsh: ['app', 'Une fenêtre PowerShell (commandes).'], cmd: ['app', 'Une invite de commandes.'],
};
// la phrase à montrer : connue, ou devinée d'après le dossier ; un nom de Windows lancé hors du dossier de Windows est signalé
function prWhy(name, path = '') {
  const k = String(name).toLowerCase().replace(/\.exe$/, ''), p = String(path), known = PR_KNOW[k];
  if (known && (known[0] === 'win' || known[0] === 'winok') && p && !/\\windows/i.test(p)) return ['warn', 'Ce nom est celui d’un programme de Windows, mais il n’est pas dans le dossier de Windows : fais analyser ce fichier par l’antivirus.'];
  if (known) return known;
  if (/\\AppData\\Local\\Temp\\/i.test(p)) return ['warn', 'Lancé depuis un dossier temporaire : inhabituel pour un programme qui reste ouvert. Si tu ne le connais pas, fais analyser le fichier par l’antivirus.'];
  if (/^[A-Z]:\\Windows\\/i.test(p)) return ['win', 'Fait partie de Windows.'];
  if (/\\Program Files/i.test(p)) return ['app', 'Un programme installé sur le PC.'];
  return null;
}
const PR_TAG = { win: 'WINDOWS · ne pas fermer', winok: 'WINDOWS · sans danger, il se relance', drv: 'PILOTE', warn: 'À VÉRIFIER' };

export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = host;
  const nbConfirm = host.confirm;  // la boîte de confirmation de NeoDex, à la place de celle de Windows
  const folder = ctx.folder, legacy = ctx.legacy || {};
  ctx.host.addStyle(CSS);
  view.innerHTML = HTML;
  const $ = id => id === "procsApp" ? view : (view.querySelector('#' + id) || document.getElementById(id));  // les identifiants de ta vue d'abord, puis ceux de la page (fenêtres, menus)
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const __icon = () => ctx.icon;  // l'icône de ce plugin
  // ---- ton code d'origine ----
const gb = b => (b / 1073741824).toFixed(b < 107374182400 ? 1 : 0).replace('.', ',') + ' Go';
const mo = b => b >= 1073741824 ? gb(b) : Math.round(b / 1048576) + ' Mo';

/* ---------- Processus app: programs grouped by name, CPU and memory, refreshed every 2 seconds while shown ---------- */
let prTimer = null, prSort = 'cpu', prOpenGroups = new Set();
async function prOpen() {
  clearTimeout(prTimer);
  if (!view.classList.contains('on')) return;
  prTimer = setTimeout(prOpen, 2000);
  let list; try { list = await neo.procList(); } catch (e) { $('prList').replaceChildren(el('div', 'hint', 'Lecture impossible : ' + e.message)); return; }
  const q = $('prFilter').value.trim().toLowerCase(), groups = new Map();
  const hideWin = $('prHideWin').checked;
  for (const p of list) { const k = p.name.toLowerCase(); if (!groups.has(k)) groups.set(k, {name: p.name, procs: [], cpu: 0, mem: 0, title: '', path: '', protected: false}); const gr = groups.get(k); gr.procs.push(p); gr.cpu += p.cpu; gr.mem += p.mem; gr.title ||= p.title; gr.path ||= p.path; gr.protected ||= p.protected; }
  const rows = [...groups.values()].filter(gr => (!q || (gr.name + ' ' + gr.title + ' ' + (prWhy(gr.name, gr.path)?.[1] || '')).toLowerCase().includes(q)) && !(hideWin && /^win/.test(prWhy(gr.name, gr.path)?.[0] || ''))).sort(prSort === 'mem' ? (a, b) => b.mem - a.mem : prSort === 'name' ? (a, b) => a.name.localeCompare(b.name, 'fr') : (a, b) => b.cpu - a.cpu || b.mem - a.mem);
  const cpu = [...groups.values()].reduce((s, gr) => s + gr.cpu, 0);
  prPlugins(q);
  $('prInfo').textContent = list.length + ' processus · ' + groups.size + ' programmes · processeur ' + Math.round(cpu) + ' %';  // no memory total: shared memory would be counted several times
  $('prList').replaceChildren(...rows.slice(0, 150).map(gr => {
    const r = el('div', 'prRow'), ic = el('img'), n = el('div', 'tn'), x = el('button', 'btn px', 'Fermer');
    ic.onerror = () => ic.style.visibility = 'hidden'; if (gr.path) neo.exeIcon(gr.path).then(u => { ic.src = u; }, () => ic.onerror()); else ic.onerror();  // l'icône du programme, donnée par NeoDex
    n.append(gr.name + (gr.procs.length > 1 ? ' (' + gr.procs.length + ')' : ''), el('small', '', gr.title || gr.path || ''));
    const why = prWhy(gr.name, gr.path); if (why) { const w = el('small', 'why'); if (PR_TAG[why[0]]) w.append(el('span', 'prTag ' + why[0], PR_TAG[why[0]])); w.append(why[1]); n.append(w); }
    x.disabled = gr.protected; x.title = gr.protected ? 'Programme de Windows : le fermer pourrait bloquer le PC' : 'Forcer la fermeture';
    x.onclick = async () => {
      if (!await nbConfirm('Forcer la fermeture de « ' + gr.name + ' »' + (gr.procs.length > 1 ? ' (' + gr.procs.length + ' processus)' : '') + ' ?\nCe qui n\'est pas enregistré dans ce programme sera perdu.')) return;
      const r = await neo.procEnd(gr.procs.map(p => p.pid));
      toast(r.failed.length ? 'Fermé en partie : ' + r.failed.length + ' processus refusé(s) (droits administrateur ?)' : gr.name + ' fermé', !!r.failed.length);
      prOpen();
    };
    r.append(ic, n, el('span', 'v' + (gr.cpu > 25 ? ' hot' : ''), gr.cpu.toFixed(1).replace('.', ',') + ' %'), el('span', 'v', mo(gr.mem)), x);
    return r;
  }));
}
// the plugins of NeoDex: each one runs in a process of its own (memory, processor), plus what it downloaded since NeoDex started and its place on the disk
async function prPlugins(q) {
  let use; try { use = await neo.pluginsUsage(); } catch { return; }  // an older NeoDex: no such list, the card stays hidden
  const list = use.plugins;
  $('prPlugCard').hidden = false;
  const rows = list.filter(p => !q || p.name.toLowerCase().includes(q)).sort(prSort === 'mem' ? (a, b) => b.mem - a.mem : prSort === 'name' ? (a, b) => a.name.localeCompare(b.name, 'fr') : (a, b) => b.cpu - a.cpu || b.running - a.running || b.mem - a.mem);
  // the plugins opened together share one process: its memory and processor, once
  const sharedRows = use.shared.map(s => { const r = el('div', 'prRow'), n = el('div', 'tn'); n.append('Plugins ouverts (processus partagé)', el('small', '', s.plugins + ' plugins dans le même processus de Chromium')); r.append(el('i', 'prDot on'), n, el('span', 'v' + (s.cpu > 25 ? ' hot' : ''), s.cpu.toFixed(1).replace('.', ',') + ' %'), el('span', 'v', mo(s.mem)), el('span')); return r; });
  $('prPlugins').replaceChildren(...sharedRows, ...rows.map(p => {
    const r = el('div', 'prRow'), n = el('div', 'tn'), x = el('button', 'btn px', 'Arrêter'), dot = el('i', 'prDot' + (p.running ? ' on' : ''));
    const net = p.net.requests ? mo(p.net.bytes) + ' téléchargés (' + p.net.requests + ' requête' + (p.net.requests > 1 ? 's' : '') + ')' : 'pas de réseau';
    n.append(p.name, el('small', '', (p.running ? (p.where === 'principal' ? 'tourne dans NeoDex' : 'ouvert') : 'arrêté') + ' · ' + net + ' · disque ' + mo(p.disk)));
    x.disabled = p.where !== 'cadre'; x.title = p.where === 'cadre' ? 'Le décharger : il libère sa mémoire et repart quand tu l\'ouvres' : p.running ? 'Il tourne dans NeoDex lui-même : désactive-le dans NeoStore pour l\'arrêter' : 'Déjà arrêté';
    x.onclick = async () => { try { await neo.pluginStop(p.id); toast(p.name + ' arrêté'); } catch (e) { toast(e.message, true); } prOpen(); };
    r.append(dot, n, el('span', 'v' + (p.cpu > 25 ? ' hot' : ''), p.mem ? p.cpu.toFixed(1).replace('.', ',') + ' %' : p.shared ? 'partagé' : '—'), el('span', 'v', p.mem ? mo(p.mem) : p.shared ? 'partagé' : '—'), x);
    return r;
  }));
}
$('prFilter').oninput = () => prOpen();
$('prHideWin').onchange = () => prOpen();
console.assert(prWhy('svchost.exe', 'C:\\Windows\\System32\\svchost.exe')[0] === 'win' && prWhy('svchost.exe', 'C:\\Users\\x\\AppData\\Roaming\\svchost.exe')[0] === 'warn' && prWhy('System', '')[0] === 'win'
  && prWhy('outil.exe', 'C:\\Users\\x\\AppData\\Local\\Temp\\a\\outil.exe')[0] === 'warn' && prWhy('Jeu.exe', 'D:\\Program Files\\Jeu\\Jeu.exe')[0] === 'app' && prWhy('inconnu.exe', 'D:\\x\\inconnu.exe') === null
  && prWhy('MsMpEng.exe', 'C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\MsMpEng.exe')[0] === 'win', 'processus : explications');
view.__why = prWhy;  // le test
$('prSort').onchange = e => { prSort = e.target.value; prOpen(); };  // (non indenté : les textes sur plusieurs lignes restent exactement les tiens)
  // ---- fin ----
  ctx.onOpen(() => { prOpen(); });
}
