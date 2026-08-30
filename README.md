# win7OS Portfolio

Interactive Windows 7 style portfolio built with React + Vite.

The project simulates a desktop environment with draggable windows, taskbar/start menu behavior, classic Win7 styling, and multiple built-in apps/games.

## Main features

- Windows 7 desktop UI (icons, taskbar, start menu, window controls)
- Built-in apps (e.g. Internet Explorer, Explorer, Media Player, Paint, Notepad, Command Prompt, PowerShell)
- Portfolio sections as apps (`About Me`, `Resume`, documents/pictures/music)
- Game windows (`DOOM`, `GTA: Vice City`)
- Boot screen/video experience

## Tech stack

- React 19
- Vite 7
- `react-rnd` for window drag/resize
- `js-dos` / `emulators-ui` for DOS/game integration

## Scripts

- `npm run dev`  
  Starts the frontend and also tries to start the Vice City backend (`reVCDOS`) on port `8000`.
- `npm run dev:web`  
  Starts only the Vite frontend.
- `npm run build`  
  Production build.
- `npm run preview`  
  Preview production build.
- `npm run lint`  
  Run ESLint.

## Local development

1. Install dependencies:

   npm install

2. Start development:

   npm run dev

If Python or reVCDOS is not available, the script continues with frontend-only mode.

## Vice City backend notes

- Expected location: `public/games/reVCDOS-main`
- Required packed file: `revcdos.bin`
- Backend command (auto-started by `npm run dev`):
  `server.py --packed revcdos.bin --custom_saves --port 8000`

If backend startup fails, install its Python dependencies from the reVCDOS folder (see `requirements.txt`).

## Repository

GitHub: https://github.com/notfoolish/win7portfolio
