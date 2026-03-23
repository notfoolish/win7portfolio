# win7OS

Windows 7 style React desktop UI with integrated in-app game windows.

## What was added

- `GTA: Vice City` app window (`/vicecity/` by default)
- Vice City shortcut on desktop + Start menu
- Vice City starts manually (not auto-open)
- `npm run dev` now starts both:
  - Vite frontend
  - reVCDOS backend in packed mode (`server.py --packed revcdos.bin --custom_saves --port 8000`)

## Local development

```bash
npm install
npm run dev
```

If needed, create `.env` from `.env.example` and set:

```bash
VITE_VICE_CITY_URL=/vicecity/
```

## Notes

- Linux path is case-sensitive: `reVCDOS-main` is not the same as `revcdos-main`.
- For local dev proxy, `/vicecity/` is forwarded to `http://127.0.0.1:8000`.
