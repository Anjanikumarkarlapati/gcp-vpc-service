const express = require('express');
const path = require('path');
const seed = require('./data/sample.json');

const COLLECTIONS = {
  vpcs: ['name', 'project'],
  subnets: ['vpcId', 'name', 'region', 'cidr'],
  'firewall-rules': ['vpcId', 'name', 'direction', 'action', 'protocol'],
};
const KEYS = { vpcs: 'vpcs', subnets: 'subnets', 'firewall-rules': 'firewallRules' };
const PREFIX = { vpcs: 'vpc', subnets: 'sn', 'firewall-rules': 'fw' };

function createApp() {
  const db = JSON.parse(JSON.stringify(seed));
  let counter = 100;
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.get('/api/summary', (_req, res) =>
    res.json({
      vpcs: db.vpcs.length,
      subnets: db.subnets.length,
      firewallRules: db.firewallRules.length,
    })
  );

  for (const [route, required] of Object.entries(COLLECTIONS)) {
    const list = () => db[KEYS[route]];

    app.get(`/api/${route}`, (req, res) => {
      let items = list();
      if (req.query.vpcId) items = items.filter((i) => i.vpcId === req.query.vpcId);
      res.json(items);
    });

    app.get(`/api/${route}/:id`, (req, res) => {
      const item = list().find((i) => i.id === req.params.id);
      item ? res.json(item) : res.status(404).json({ error: 'not found' });
    });

    app.post(`/api/${route}`, (req, res) => {
      const missing = required.filter((k) => !req.body[k]);
      if (missing.length) return res.status(400).json({ error: `missing: ${missing.join(', ')}` });
      if (req.body.vpcId && !db.vpcs.some((v) => v.id === req.body.vpcId))
        return res.status(400).json({ error: 'unknown vpcId' });
      const item = { ...req.body, id: `${PREFIX[route]}-${++counter}` };
      if (route === 'vpcs') item.createdAt = new Date().toISOString();
      list().push(item);
      res.status(201).json(item);
    });

    app.delete(`/api/${route}/:id`, (req, res) => {
      const idx = list().findIndex((i) => i.id === req.params.id);
      if (idx < 0) return res.status(404).json({ error: 'not found' });
      const [removed] = list().splice(idx, 1);
      if (route === 'vpcs') {
        db.subnets = db.subnets.filter((s) => s.vpcId !== removed.id);
        db.firewallRules = db.firewallRules.filter((f) => f.vpcId !== removed.id);
      }
      res.status(204).end();
    });
  }

  app.use(express.static(path.join(__dirname, '..', 'frontend')));
  return app;
}

module.exports = { createApp };
