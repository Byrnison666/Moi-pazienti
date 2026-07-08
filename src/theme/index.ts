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
    accentSoft: string;
    accentStrong: string;
    text: string;
    textMuted: string;
    textInverse: string;
    danger: string;
    dangerSoft: string;
    success: string;
    warning: string;
    overlay: string;
    chip: string;
  };
  spacing: (n: number) => number;
  radius: { sm: number; md: number; lg: number; xl: number };
  font: { regular: string; medium: string; bold: string; extrabold: string };
  fontSize: {
    xs: number; sm: number; md: number; lg: number; xl: number; xxl: number;
  };
}

const baseSpacing = (n: number) => n * 4;

const radius = { sm: 10, md: 15, lg: 24, xl: 30 };

const fontSize = { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26 };

const fontFamily = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#F1EEE7',
    surface: '#FFFFFF',
    surfaceAlt: '#F6F2EA',
    border: '#E9E3D7',
    primary: '#1B8AA0',
    primarySoft: '#E1F1F4',
    accent: '#3FB79A',
    accentSoft: '#E4F3EC',
    accentStrong: '#2E9C81',
    text: '#1E2A2B',
    textMuted: '#6E7A78',
    textInverse: '#FFFFFF',
    danger: '#D2685E',
    dangerSoft: 'rgba(210, 104, 94, 0.14)',
    success: '#2E9C81',
    warning: '#C7962E',
    overlay: 'rgba(22, 52, 58, 0.4)',
    chip: '#F6F2EA',
  },
  spacing: baseSpacing,
  radius,
  font: fontFamily,
  fontSize,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#0F1719',
    surface: '#182527',
    surfaceAlt: '#1F2E31',
    border: '#2B3C3F',
    primary: '#4BBFD3',
    primarySoft: '#12313A',
    accent: '#5FD3B4',
    accentSoft: '#123029',
    accentStrong: '#5FD3B4',
    text: '#E8F0F0',
    textMuted: '#90A3A4',
    textInverse: '#0F1719',
    danger: '#EE7A70',
    dangerSoft: 'rgba(238, 122, 112, 0.18)',
    success: '#5FD3B4',
    warning: '#E4B767',
    overlay: 'rgba(0, 0, 0, 0.55)',
    chip: '#1F2E31',
  },
  spacing: baseSpacing,
  radius,
  font: fontFamily,
  fontSize,
};
