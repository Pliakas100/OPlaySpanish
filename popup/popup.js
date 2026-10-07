const $ = (id) => document.getElementById(id);

async function init() {
    const settings = await chrome.storage.local.get({ enabled: true, mode: 'hover', debug: false, alwaysOn: false });
    $('enabled').checked = settings.enabled;
    $('mode').value = settings.mode;
    $('alwaysOn').checked = settings.alwaysOn;
    $('debug').checked = settings.debug;
}

$('enabled').addEventListener('change', (e) => chrome.storage.local.set({ enabled: e.target.checked }));
$('mode').addEventListener('change', (e) => chrome.storage.local.set({ mode: e.target.value }));
$('alwaysOn').addEventListener('change', (e) => chrome.storage.local.set({ alwaysOn: e.target.checked }));
$('debug').addEventListener('change', (e) => chrome.storage.local.set({ debug: e.target.checked }));

$('analyze').addEventListener('click', async () => {
    const out = $('out');
    out.hidden = false;
    out.textContent = 'Analizando…';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
        const result = await chrome.tabs.sendMessage(tab.id, { type: 'oplay-es:diagnose' });
        out.textContent = JSON.stringify(result, null, 2);
    } catch (err) {
        out.textContent = 'Sin respuesta de la extensión. Recarga la pestaña de oplaytcg.com e inténtalo de nuevo.\n\n' + err.message;
    }
});

init();
