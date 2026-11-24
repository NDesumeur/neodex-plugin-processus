// lancé par le test « local » de NeoDex : la liste des processus, l'explication des processus de Windows, le filtre « Cacher Windows »
module.exports = async ({ pj, sleep, shot }) => {
  await sleep(2500);
  const rows = () => pj(`document.querySelectorAll('#prList .prRow:not(.head)').length`);
  const n = await rows();
  if (n < 5) throw new Error('liste presque vide : ' + n);
  const svc = await pj(`[...document.querySelectorAll('#prList .prRow')].find(r => /^svchost/i.test(r.textContent))?.querySelector('small.why')?.textContent || ''`);
  if (!/WINDOWS · ne pas fermer/.test(svc) || !/services de Windows/.test(svc)) throw new Error('svchost sans explication : ' + svc);
  const explained = await pj(`document.querySelectorAll('#prList small.why').length`);
  if (shot) await shot('explications');
  await pj(`(() => { const c = document.getElementById('prHideWin'); c.checked = true; c.dispatchEvent(new Event('change')); })(), 0`); await sleep(1500);
  const n2 = await rows(), still = await pj(`[...document.querySelectorAll('#prList .prRow')].some(r => /^svchost/i.test(r.textContent))`);
  if (n2 >= n || still) throw new Error('Cacher Windows : ' + n + ' → ' + n2);
  await pj(`(() => { const c = document.getElementById('prHideWin'); c.checked = false; c.dispatchEvent(new Event('change')); })(), 0`);
  // un faux svchost hors du dossier de Windows est signalé
  const fake = await pj(`document.getElementById('prList').closest('.appWrap').parentElement.__why('svchost.exe', 'C:\\\\Users\\\\Jean Martin\\\\AppData\\\\Roaming\\\\svchost.exe')[0]`);
  if (fake !== 'warn') throw new Error('faux svchost non signalé : ' + fake);
  return n + ' groupes, ' + explained + ' expliqués, svchost rassurant, Cacher Windows → ' + n2 + ', faux svchost signalé';
};
