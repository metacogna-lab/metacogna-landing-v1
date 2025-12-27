# Client & Associates Portal Setup

This portal is designed to be a lightweight SPA extension hosted at `portal.metacogna.ai`.

## Architecture
- **Frontend**: React (Vite) - integrated into the main repository.
- **Backend**: Cloudflare Workers (Edge).
- **Storage**: Cloudflare Workers KV (Key-Value Store).

## Local Development (Frontend)
1. Ensure you have Node.js installed.
2. Run `npm install`.
3. Run `npm start` (or `npm run dev`).
4. Login using the "Lab Admin" login or the Login modal.
   - User: `metacogna-lab` (Mock Auth).

## Deployment (Cloudflare Workers)
1. Install Wrangler: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Initialize KV Namespace:
   ```bash
   wrangler kv:namespace create "PORTAL_UPDATES"
   ```
4. Update `wrangler.toml` with the ID output from the command above.
5. Deploy the API:
   ```bash
   wrangler deploy workers/worker.js --name metacogna-portal-api
   ```

## API Specification
- `GET /api/portal/updates`: Returns array of `PortalUpdate` objects.
- `PATCH /api/portal/updates/:id`: Updates specific fields.

## Mocking
Currently, `services/portalService.ts` contains a fallback mechanism. If the API endpoint is unreachable (e.g., local dev without a running worker), it returns static mock data.
