let apps = [];
let currentId = null;

const $ = id => document.getElementById(id);

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function loadApplications() {
  try {
    apps = await apiRequest('/api/applications');
    route();
  } catch (error) {
    console.error(error);
    apps = [];
    route();
    alert('Could not connect to the JobTrack API. Start the server with npm start.');
  }
}

const counts = () => ({
  Total: apps.length,
  Applied: apps.filter(a => a.status === 'Applied').length,
  Interview: apps.filter(a => a.status === 'Interview').length,
  Offer: apps.filter(a => a.status === 'Offer').length
});

function renderDashboard() {
  const c = counts();
  $('totalStat').textContent = c.Total;
  $('appliedStat').textContent = c.Applied;
  $('interviewStat').textContent = c.Interview;
  $('offerStat').textContent = c.Offer;
  $('heroTotal').textContent = c.Total;
  $('heroApplied').textContent = c.Applied;
  $('heroInterview').textContent = c.Interview;
  $('heroOffer').textContent = c.Offer;
  $('pipelineRows').innerHTML = ['Applied','Interview','Offer','Rejected'].map(s => {
    const n = apps.filter(a => a.status === s).length;
    const pct = apps.length ? Math.round(n / apps.length * 100) : 0;
    return `<div class="pipeline-row"><span class="pipeline-label">${s}</span><span class="bar"><i style="width:${pct}%"></i></span><b class="pipeline-count">${n}</b></div>`;
  }).join('');
  $('recentRows').innerHTML = apps.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0,5).map(a =>
    `<div class="recent-item"><span class="avatar">${a.company[0] || '?'}</span><div><b>${a.company}</b><small>${a.role}</small></div><span class="status ${a.status}">${a.status}</span></div>`
  ).join('') || '<p>No applications yet.</p>';
}

function renderTable() {
  const q = $('searchInput').value.toLowerCase();
  const f = $('statusFilter').value;
  const list = apps.filter(a => (f === 'All' || a.status === f) && (`${a.company} ${a.role} ${a.location}`).toLowerCase().includes(q));
  $('applicationTable').innerHTML = list.map(a =>
    `<tr><td><strong>${a.company}</strong></td><td>${a.role}</td><td><span class="status ${a.status}">${a.status}</span></td><td>${formatDate(a.date)}</td><td>${a.location || '—'}</td><td><button class="view-btn" onclick="showDetail(${a.id})">View →</button></td></tr>`
  ).join('') || '<tr><td colspan="6" style="text-align:center;padding:35px">No applications found.</td></tr>';
}

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
}

function showDetail(id) {
  currentId = id;
  const a = apps.find(x => x.id === id);
  if (!a) return;
  $('detailTitle').textContent = a.role;
  $('detailSubtitle').textContent = `${a.company} • ${a.location || 'Location not specified'}`;
  $('detailCompany').textContent = a.company;
  $('detailRole').textContent = a.role;
  $('detailLogo').textContent = a.company[0] || '?';
  $('detailStatus').textContent = a.status;
  $('detailStatus').className = `status ${a.status}`;
  $('detailDate').textContent = formatDate(a.date);
  $('detailLocation').textContent = a.location || '—';
  $('detailType').textContent = a.type || 'Full-time';
  $('detailNotes').textContent = a.notes || 'No notes added.';
  $('timelineDate').textContent = formatDate(a.date);
  $('timelineStatus').textContent = a.status;
  location.hash = 'details';
}

function openModal(id = null) {
  $('modal').classList.remove('hidden');
  $('editId').value = id || '';
  $('modalTitle').textContent = id ? 'Edit Application' : 'Add Application';
  const a = id ? apps.find(x => x.id === id) : null;
  $('company').value = a?.company || '';
  $('role').value = a?.role || '';
  $('status').value = a?.status || 'Applied';
  $('date').value = a?.date || new Date().toISOString().slice(0,10);
  $('location').value = a?.location || '';
  $('type').value = a?.type || 'Full-time';
  $('notes').value = a?.notes || '';
}

function closeModal() { $('modal').classList.add('hidden'); }

function route() {
  const hash = location.hash.replace('#','') || 'home';
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const page = $(hash) || $('home');
  page.classList.remove('hidden');
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.dataset.page === hash));
  renderDashboard();
  renderTable();
}

document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => {}));
['addTopBtn','startBtn','addDashBtn','addAppsBtn'].forEach(id => $(id).addEventListener('click', () => openModal()));
$('closeModal').onclick = closeModal;
$('cancelModal').onclick = closeModal;
$('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
$('searchInput').addEventListener('input', renderTable);
$('statusFilter').addEventListener('change', renderTable);

$('appForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('editId').value;
  const data = {
    company: $('company').value.trim(),
    role: $('role').value.trim(),
    status: $('status').value,
    date: $('date').value,
    location: $('location').value.trim(),
    type: $('type').value,
    notes: $('notes').value.trim()
  };
  try {
    if (id) {
      const updated = await apiRequest(`/api/applications/${id}`, {method:'PUT', body:JSON.stringify(data)});
      apps = apps.map(a => a.id === Number(id) ? updated : a);
    } else {
      const created = await apiRequest('/api/applications', {method:'POST', body:JSON.stringify(data)});
      apps.push(created);
    }
    closeModal();
    location.hash = 'applications';
    route();
  } catch (error) {
    alert(error.message);
  }
});

$('editBtn').onclick = () => openModal(currentId);
$('deleteBtn').onclick = async () => {
  if (!currentId) return;
  if (!confirm('Delete this application?')) return;
  try {
    await apiRequest(`/api/applications/${currentId}`, {method:'DELETE'});
    apps = apps.filter(a => a.id !== currentId);
    location.hash = 'applications';
    route();
  } catch (error) {
    alert(error.message);
  }
};

window.showDetail = showDetail;
window.addEventListener('hashchange', route);
route();
loadApplications();
