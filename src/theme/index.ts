export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    primary: string;
    primarySoft: string;
    accent: string;
    text: string;
    textMuted: string;
    textInverse: string;
    danger: string;
    success: string;
    warning: string;
    overlay: string;
    chip: string;
  };
  spacing: (n: number) => number;
  radius: { sm: number; md: number; lg: number; xl: number };
  font: { regular: string; medium: string; bold: string };
  fontSize: {
    xs: number; sm: number; md: number; lg: number; xl: number; xxl: number;
  };
}

const baseSpacing = (n: number) => n * 4;

const radius = { sm: 6, md: 10, lg: 16, xl: 22 };

const fontSize = { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26 };

const fontFamily = { regular: 'System', medium: 'System', bold: 'System' };

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#F4F7FB',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F4F9',
    border: '#E2E8F0',
    primary: '#1F8FB8',
    primarySoft: '#E1F2F8',
    accent: '#2BB1B7',
    text: '#0F2A3A',
    textMuted: '#5C7080',
    textInverse: '#FFFFFF',
    danger: '#E0524A',
    success: '#2BA889',
    warning: '#E0A03A',
    overlay: 'rgba(15, 42, 58, 0.4)',
    chip: '#EAF3F8',
  },
  spacing: baseSpacing,
  radius,
  font: fontFamily,
  fontSize,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#0E1620',
    surface: '#172230',
    surfaceAlt: '#1F2D3D',
    border: '#2A3B4E',
    primary: '#4FB7DC',
    primarySoft: '#1B3340',
    accent: '#3ECDC9',
    text: '#E6EEF6',
    textMuted: '#8AA0B4',
    textInverse: '#0E1620',
    danger: '#F1746B',
    success: '#46C99D',
    warning: '#F0B85A',
    overlay: 'rgba(0, 0, 0, 0.55)',
    chip: '#1F2D3D',
  },
  spacing: baseSpacing,
  radius,
  font: fontFamily,
  fontSize,
};
