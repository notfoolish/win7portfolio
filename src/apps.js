// ─── Central app registry ───────────────────────────────────────────────────
// single: true  → only one instance allowed; re-clicking focuses/restores it
// single: false → multiple instances allowed (e.g. Notepad)

export const APPS = {
  ie: {
    appId: 'ie', title: 'Internet Explorer',
    icon: '/win7icons/Internet Explorer/iexplore_32528.ico',
    single: true, width: 900, height: 580,
  },
  explorer: {
    appId: 'explorer', title: 'Windows Explorer',
    icon: '/win7icons/Standard Folders/imageres_3.ico',
    single: true, width: 720, height: 500,
  },
  wmp: {
    appId: 'wmp', title: 'Windows Media Player',
    icon: '/win7icons/WMP12 Icons/WMP 12 1.ico',
    single: true, width: 720, height: 500,
  },
  wordpad: {
    appId: 'wordpad', title: 'WordPad',
    icon: '/win7icons/Wordpad/wordpad_128.ico',
    single: false, width: 620, height: 460,
  },
  paint: {
    appId: 'paint', title: 'Paint',
    icon: '/win7icons/Default Programs/mspaint_2.ico',
    single: false, width: 720, height: 520,
  },
  notepad: {
    appId: 'notepad', title: 'Notepad',
    icon: '/win7icons/Default Programs/notepad_2.ico',
    single: false, width: 500, height: 360,
  },
  cmd: {
    appId: 'cmd', title: 'Command Prompt',
    icon: '/win7icons/Default Programs/cmd_IDI_APPICON.ico',
    single: false, width: 600, height: 380,
  },
  pshell: {
    appId: 'pshell', title: 'Windows PowerShell',
    icon: '/win7icons/Windows PowerShell/powershell_MSH_MAIN.ico',
    single: false, width: 620, height: 400,
  },
  docs: {
    appId: 'docs', title: 'Documents',
    icon: '/win7icons/Libraries/imageres_1002.ico',
    single: true, width: 720, height: 500,
  },
  pics: {
    appId: 'pics', title: 'Pictures',
    icon: '/win7icons/Libraries/imageres_1003.ico',
    single: true, width: 720, height: 500,
  },
  music: {
    appId: 'music', title: 'Music',
    icon: '/win7icons/Libraries/imageres_1004.ico',
    single: true, width: 720, height: 500,
  },
  games: {
    appId: 'games', title: 'Games',
    icon: '/win7icons/Games/Solitaire_108.ico',
    single: true, width: 720, height: 520,
  },
  computer: {
    appId: 'computer', title: 'Computer',
    icon: '/win7icons/Shell32.dll/shell32_16.ico',
    single: true, width: 720, height: 500,
  },
  cp: {
    appId: 'cp', title: 'Control Panel',
    icon: '/win7icons/Control Panel/imageres_27.ico',
    single: true, width: 720, height: 500,
  },
  devices: {
    appId: 'devices', title: 'Devices and Printers',
    icon: '/win7icons/Control Panel/imageres_78.ico',
    single: true, width: 720, height: 500,
  },
  defaults: {
    appId: 'defaults', title: 'Default Programs',
    icon: '/win7icons/Default Programs/cmd_IDI_APPICON.ico',
    single: true, width: 620, height: 450,
  },
  help: {
    appId: 'help', title: 'Help and Support',
    icon: '/win7icons/Special Folders/imageres_8.ico',
    single: true, width: 720, height: 520,
  },
  recycle: {
    appId: 'recycle', title: 'Recycle Bin',
    icon: '/win7icons/Shell32.dll/imageres_55.ico',
    single: true, width: 620, height: 440,
  },
}

// These three are always visible as pinned icons on the taskbar
export const TASKBAR_PINNED_IDS = ['ie', 'explorer', 'wmp']
