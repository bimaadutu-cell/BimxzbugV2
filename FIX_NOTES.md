# BIMZOFFICIAL PROJECT v3 — Railway WhatsApp fix

## What was fixed
- `/api/wa/status` is now read-only and never calls `ensureWA()` during polling.
- Added a single long-lived Baileys initialization from Next.js Node runtime startup.
- Added a single reconnect timer so multiple close events cannot spawn parallel sockets.
- Added socket generation protection for stale `connection.update` events.
- Added `BAILEYS_AUTH_DIR` for Railway Volume persistence.
- Added `connectedAt` and real `lastError` to status for debugging.
- Pairing/QR still use the same global socket.
- Removed auth/session from the deployment archive so a stale development session cannot be reused accidentally. Pair once on Railway and persist it on a Volume.

## Railway
1. Add a Railway Volume.
2. Mount it, for example at `/data`.
3. Set `BAILEYS_AUTH_DIR=/data/auth_info_bimx`.
4. Deploy with `npm start`.

## Important
If the WhatsApp session was already linked by another running copy of the bot, log that copy out first, then pair this Railway instance once.
