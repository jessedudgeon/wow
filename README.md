# Dudgeon WoW

This version is laid out as a normal static-site repository.

## Root structure

- `index.html` — public home page
- `assets/` — CSS, JavaScript, favicon
- `downloads/` — public client configuration downloads
- `404.html` — custom not-found page
- `functions/api/status.js` — Cloudflare Pages Function for live realm status

## Cloudflare Pages deployment

Connect this repository to Cloudflare Pages.

Use:

- Framework preset: None
- Build command: leave blank
- Build output directory: `/`

Then attach:

- `wow.dudgeon.io`

The status function will be available at:

- `/api/status`

The function checks:

- `wowclient.dudgeon.io:3724`
- `wowclient.dudgeon.io:8085`

Make sure `wowclient.dudgeon.io` is DNS-only and points at the public IP that forwards those TCP ports to AzerothCore.
