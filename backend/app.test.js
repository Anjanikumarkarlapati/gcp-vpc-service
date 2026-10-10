const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('./app');

test('API serves sample data and supports create/delete', async () => {
  const server = createApp().listen(0);
  const base = `http://localhost:${server.address().port}/api`;
  try {
    const vpcs = await (await fetch(`${base}/vpcs`)).json();
    assert.strictEqual(vpcs.length, 3);

    const subnets = await (await fetch(`${base}/subnets?vpcId=vpc-1`)).json();
    assert.strictEqual(subnets.length, 3);

    const bad = await fetch(`${base}/vpcs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    assert.strictEqual(bad.status, 400);

    const created = await (await fetch(`${base}/vpcs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'x', project: 'p' }) })).json();
    assert.ok(created.id);
    assert.strictEqual((await fetch(`${base}/vpcs/${created.id}`, { method: 'DELETE' })).status, 204);
  } finally {
    server.close();
  }
});
