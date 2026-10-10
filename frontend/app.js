const $ = (s) => document.querySelector(s);
const api = async (path, opts) => {
  const res = await fetch(`/api/${path}`, opts);
  if (!res.ok && res.status !== 204) throw new Error((await res.json()).error || res.statusText);
  return res.status === 204 ? null : res.json();
};
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fill = (sel, rows) => ($(`${sel} tbody`).innerHTML = rows.join('') || '<tr><td colspan="6">None</td></tr>');
let selected = null;

async function load() {
  const [vpcs, sum] = await Promise.all([api('vpcs'), api('summary')]);
  $('#summary').textContent = `${sum.vpcs} VPCs · ${sum.subnets} subnets · ${sum.firewallRules} firewall rules`;
  fill('#vpcs', vpcs.map((v) => `<tr data-id="${esc(v.id)}" class="${v.id === selected ? 'active' : ''}">
    <td>${esc(v.name)}</td><td>${esc(v.project)}</td><td>${esc(v.routingMode || '')}</td>
    <td>${v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}</td>
    <td><button class="del" data-del="${esc(v.id)}">Delete</button></td></tr>`));
  await showDetail(vpcs);
}

async function showDetail(vpcs) {
  const vpc = vpcs.find((v) => v.id === selected);
  if (!vpc) { selected = null; $('#detail-title').textContent = 'Select a VPC'; fill('#subnets', []); fill('#rules', []); return; }
  $('#detail-title').textContent = vpc.name;
  const [subnets, rules] = await Promise.all([api(`subnets?vpcId=${vpc.id}`), api(`firewall-rules?vpcId=${vpc.id}`)]);
  fill('#subnets', subnets.map((s) => `<tr><td>${esc(s.name)}</td><td>${esc(s.region)}</td><td>${esc(s.cidr)}</td><td>${s.privateGoogleAccess ? 'Yes' : 'No'}</td></tr>`));
  fill('#rules', rules.map((r) => `<tr><td>${esc(r.name)}</td><td>${esc(r.direction)}</td>
    <td class="${r.action.toLowerCase()}">${esc(r.action)}</td><td>${esc(r.protocol)}${r.ports ? ':' + esc(r.ports) : ''}</td>
    <td>${esc(r.sourceRanges.join(', '))}</td><td>${esc(r.priority)}</td></tr>`));
}

$('#vpcs').addEventListener('click', async (e) => {
  const del = e.target.closest('[data-del]');
  if (del) { await api(`vpcs/${del.dataset.del}`, { method: 'DELETE' }); if (selected === del.dataset.del) selected = null; return load(); }
  const row = e.target.closest('tr[data-id]');
  if (row) { selected = row.dataset.id; load(); }
});

$('#vpc-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  try { await api('vpcs', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); e.target.reset(); load(); }
  catch (err) { alert(err.message); }
});

load();
