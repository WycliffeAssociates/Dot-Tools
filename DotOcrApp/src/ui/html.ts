// Single self-contained page served at `/`. Vanilla HTML + fetch — no build
// step, no framework, keeps the container "stupid low". Picks a playlist,
// lists videos with indicators, kicks off OCR (whole playlist or selected),
// shows job progress, and surfaces failures prominently.
export const UI_HTML = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>DotOcrApp</title>
<style>
  :root { font-family: ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 1.5rem; max-width: 1000px; margin-inline: auto; color: #1a1a1a; }
  h1 { font-size: 1.25rem; }
  select, button { font: inherit; padding: 0.4rem 0.6rem; }
  button { cursor: pointer; border: 1px solid #888; border-radius: 6px; background: #f4f4f4; }
  button:hover { background: #e8e8e8; }
  button.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
  table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.9rem; }
  th, td { text-align: left; padding: 0.35rem 0.5rem; border-bottom: 1px solid #eee; }
  .pill { display: inline-block; padding: 0 0.4rem; border-radius: 999px; font-size: 0.75rem; }
  .yes { background: #dcfce7; color: #166534; }
  .no { background: #f1f5f9; color: #64748b; }
  .bar { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin: 0.75rem 0; }
  .status-running { color: #b45309; } .status-done { color: #166534; }
  .status-failed { color: #b91c1c; font-weight: 600; } .status-pending { color: #64748b; }
  #failures { border: 1px solid #fecaca; background: #fef2f2; border-radius: 8px; padding: 0.5rem 0.75rem; margin-top: 1rem; }
  #failures:empty { display: none; }
  code { background: #f1f5f9; padding: 0 0.25rem; border-radius: 4px; }
  .muted { color: #64748b; font-size: 0.85rem; }
</style>
</head>
<body>
<h1>DotOcrApp — OCR producer</h1>
<p class="muted">Pick a playlist, run OCR on the whole list or selected videos. Output lands in R2 where the editor reads it. Successes go quiet; failures show below.</p>

<div class="bar">
  <select id="playlist"><option value="">Loading playlists…</option></select>
  <button id="runAll" class="primary" disabled>Run OCR on whole playlist</button>
  <button id="runSelected" disabled>Run OCR on selected</button>
  <button id="refresh">Refresh</button>
</div>

<div class="bar">
  <label for="bookFilter" class="muted">Filter by book (canonical order):</label>
  <select id="bookFilter" multiple size="5" disabled></select>
  <button id="runBooks" disabled>Run OCR on selected book(s)</button>
  <button id="clearBooks">Clear filter</button>
</div>

<table id="videos"><thead><tr>
  <th><input type="checkbox" id="selAll" /></th>
  <th>Video</th><th>Book</th><th>Ch</th><th>Chapters in BC</th><th>R2 VTT</th><th>Thumbs</th><th>Publish</th>
</tr></thead><tbody></tbody></table>

<h2 style="font-size:1rem;margin-top:1.5rem">Jobs</h2>
<table id="jobs"><thead><tr>
  <th>Video</th><th>Status</th><th>Stage</th><th>Cues</th><th>When</th>
</tr></thead><tbody></tbody></table>

<div id="failures"></div>

<script>
const $ = (s) => document.querySelector(s);
const pill = (ok) => '<span class="pill ' + (ok ? 'yes">yes' : 'no">no') + '</span>';

async function loadPlaylists() {
  const res = await fetch('/api/playlists');
  const list = await res.json();
  const sel = $('#playlist');
  sel.innerHTML = '<option value="">— choose a playlist —</option>' +
    list.map(p => '<option value="' + (p.reference_id || p.id) + '">' + p.name + '</option>').join('');
}

let videoRows = []; // cached, already sorted canonically by the server

async function loadVideos() {
  const ref = $('#playlist').value;
  const tbody = $('#videos tbody');
  if (!ref) { videoRows = []; tbody.innerHTML = ''; renderBookFilter(); return; }
  tbody.innerHTML = '<tr><td colspan="8" class="muted">Loading…</td></tr>';
  const res = await fetch('/api/playlists/' + encodeURIComponent(ref) + '/videos');
  videoRows = await res.json();
  renderBookFilter();
  renderVideos();
  $('#runAll').disabled = false;
  $('#runSelected').disabled = false;
}

// Distinct books in canonical order (rows arrive pre-sorted from the server).
function orderedBooks() {
  const seen = new Set();
  const out = [];
  for (const v of videoRows) {
    const b = v.book || '(no book)';
    if (!seen.has(b)) { seen.add(b); out.push(b); }
  }
  return out;
}

function selectedBooks() {
  return [...$('#bookFilter').selectedOptions].map(o => o.value);
}

function renderBookFilter() {
  const sel = $('#bookFilter');
  const chosen = new Set(selectedBooks());
  const list = orderedBooks();
  sel.innerHTML = list.map(b =>
    '<option value="' + b + '"' + (chosen.has(b) ? ' selected' : '') + '>' + b + '</option>'
  ).join('');
  const has = list.length > 0;
  sel.disabled = !has;
  $('#runBooks').disabled = !has;
}

function renderVideos() {
  const tbody = $('#videos tbody');
  const books = new Set(selectedBooks());
  const visible = books.size ? videoRows.filter(v => books.has(v.book || '(no book)')) : videoRows;
  tbody.innerHTML = visible.map(v =>
    '<tr><td><input type="checkbox" class="vid" value="' + v.id + '"></td>' +
    '<td>' + v.name + ' <span class="muted">' + v.id + '</span></td>' +
    '<td>' + (v.book || '<span class="muted">—</span>') + '</td>' +
    '<td>' + (v.chapter || '') + '</td>' +
    '<td>' + pill(v.hasBrightcoveChapters) + '</td>' +
    '<td>' + pill(v.hasVtt) + '</td>' +
    '<td>' + pill(v.hasThumbs) + '</td>' +
    '<td>' + (v.hasVtt ? '<button data-publish="' + v.id + '">Publish</button>' : '<span class="muted">—</span>') + '</td></tr>'
  ).join('');
  $('#selAll').checked = false;
}

function selectedVideoIds() {
  return [...document.querySelectorAll('.vid:checked')].map(c => c.value);
}

async function enqueue(mode) {
  const playlistRef = $('#playlist').value;
  if (!playlistRef) return;
  const body = { mode, playlistRef };
  if (mode === 'specific') {
    body.videoIds = selectedVideoIds();
    if (body.videoIds.length === 0) { alert('Select at least one video.'); return; }
  }
  await fetch('/api/jobs', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  loadJobs();
}

async function runSelectedBooks() {
  const playlistRef = $('#playlist').value;
  if (!playlistRef) return;
  const books = new Set(selectedBooks());
  if (books.size === 0) { alert('Select at least one book.'); return; }
  const videoIds = videoRows.filter(v => books.has(v.book || '(no book)')).map(v => v.id);
  if (videoIds.length === 0) { alert('No videos for the selected book(s).'); return; }
  await fetch('/api/jobs', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ mode: 'specific', playlistRef, videoIds }) });
  loadJobs();
}

async function publish(videoId) {
  const playlistRef = $('#playlist').value;
  const res = await fetch('/api/publish', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ playlistRef, videoId }) });
  const data = await res.json();
  alert(res.ok ? 'Published. Brightcove ingest job: ' + (data.jobId || '(no id)') : 'Publish failed: ' + (data.error || res.status));
}

async function loadJobs() {
  const res = await fetch('/api/jobs');
  const jobs = await res.json();
  $('#jobs tbody').innerHTML = jobs.map(j =>
    '<tr><td>' + j.videoId + '</td>' +
    '<td class="status-' + j.status + '">' + j.status + '</td>' +
    '<td>' + (j.stage || '') + '</td>' +
    '<td>' + (j.cueCount ?? '') + '</td>' +
    '<td class="muted">' + (j.finishedAt || j.startedAt || j.enqueuedAt || '').replace('T',' ').slice(0,19) + '</td></tr>'
  ).join('');
  const fails = jobs.filter(j => j.status === 'failed');
  $('#failures').innerHTML = fails.length === 0 ? '' :
    '<strong>' + fails.length + ' failed:</strong><ul>' +
    fails.map(f => '<li><code>' + f.videoId + '</code> — ' + (f.error || '').split('\\n')[0] + '</li>').join('') + '</ul>';
}

$('#playlist').addEventListener('change', loadVideos);
$('#runAll').addEventListener('click', () => enqueue('whole-playlist'));
$('#runSelected').addEventListener('click', () => enqueue('specific'));
$('#runBooks').addEventListener('click', runSelectedBooks);
$('#bookFilter').addEventListener('change', renderVideos);
$('#clearBooks').addEventListener('click', () => { $('#bookFilter').selectedIndex = -1; renderVideos(); });
$('#refresh').addEventListener('click', () => { loadVideos(); loadJobs(); });
// "Select all" toggles only the currently-visible (filtered) rows.
$('#selAll').addEventListener('change', (e) => document.querySelectorAll('.vid').forEach(c => { c.checked = e.target.checked; }));
$('#videos').addEventListener('click', (e) => { const id = e.target.getAttribute('data-publish'); if (id) publish(id); });

loadPlaylists();
loadJobs();
setInterval(loadJobs, 4000);
</script>
</body>
</html>`;
