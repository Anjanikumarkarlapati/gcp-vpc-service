# gcp-vpc-service

Sample GCP VPC inventory: an Express API (`backend/`) plus a static dashboard (`frontend/`), seeded from `backend/data/sample.json` (in-memory, resets on restart).

```
npm install
npm start      # http://localhost:3000
npm test
```

API: `GET/POST /api/{vpcs,subnets,firewall-rules}` (filter with `?vpcId=`), `GET/DELETE /api/<collection>/:id`, `GET /api/summary`, `GET /api/health`. Deleting a VPC removes its subnets and rules.
