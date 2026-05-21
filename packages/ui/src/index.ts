export const themes = {
  classic: {
    id: 'classic',
    name: 'Classic',
    accent: '#f9d56e',
    background: '#10141f',
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    accent: '#41f4d3',
    background: '#090b18',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    accent: '#ff4fd8',
    background: '#0a0614',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    accent: '#8ee6a7',
    background: '#111315',
  },
} as const;

export type ThemeId = keyof typeof themes;
