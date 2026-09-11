# Dudgeon WoW

Public site for `wow.dudgeon.io`.

The project uses **Cloudflare Workers + Static Assets** so one deployment can serve the website and the live realm-status API.

## Public architecture

- `wow.dudgeon.io` — website
- `wowclient.dudgeon.io` — game-server hostname
- `wowclient.dudgeon.io:3724` — AzerothCore authserver
- `wowclient.dudgeon.io:8085` — AzerothCore worldserver
- `/api/status` — Worker endpoint that tests both TCP services

The browser only talks to `wow.dudgeon.io/api/status`; it does not open the game TCP ports directly.

## Project structure

```text
public/
  index.html
  404.html
  assets/
    styles.css
    app.js
    favicon.svg
  downloads/
    config/
      realmlist.wtf
      README.txt
src/
  index.js
wrangler.jsonc
package.json
```

## Deploy

Requirements:

- Node.js
- npm
- Cloudflare account
- `dudgeon.io` managed in Cloudflare

Install Wrangler:

```bash
npm install
```

Authenticate if necessary:

```bash
npx wrangler login
```

Preview locally:

```bash
npm run dev
```

Deploy:

```bash
npm run deploy
```

After deployment, attach the custom domain `wow.dudgeon.io` to this Worker in Cloudflare.

## Realm DNS / firewall

`wowclient.dudgeon.io` should resolve to the public address that accepts AzerothCore connections.

The status API expects:

- TCP 3724 -> authserver
- TCP 8085 -> worldserver

The website will show:

- **Realm Online** when both ports are reachable
- **Partially Online** when only one is reachable
- **Realm Offline** when neither is reachable
- **Status Unavailable** if the web API itself fails

## Client config downloads

Files you want visitors to download go under:

```text
public/downloads/
```

A working `realmlist.wtf` and setup README are included already.

Only publish software/configuration you have the right to redistribute. This project intentionally does not include a World of Warcraft game client.
