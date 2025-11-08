// tailwind.config.js
import { uiTokens } from './src/theme/tokens.js';

const spacingScale = {
  xs: uiTokens.spacing[1],
  sm: uiTokens.spacing[2],
  md: uiTokens.spacing[3],
  lg: uiTokens.spacing[4],
  xl: uiTokens.spacing[5],
  '2xl': uiTokens.spacing[6],
  '3xl': uiTokens.spacing[7]
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Space Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      colors: {
        shell: {
          base: uiTokens.colors.background,
          surface: uiTokens.colors.surface,
          raised: uiTokens.colors.surfaceRaised,
          border: uiTokens.colors.border
        },
        text: {
          primary: uiTokens.colors.text,
          muted: uiTokens.colors.textMuted
        },
        accent: {
          DEFAULT: uiTokens.colors.accent,
          muted: uiTokens.colors.accentMuted
        },
        info: uiTokens.colors.info,
        warning: uiTokens.colors.warning,
        success: uiTokens.colors.success,
        danger: uiTokens.colors.danger
      },
      spacing: spacingScale,
      borderRadius: {
        shell: uiTokens.radii.lg,
        panel: uiTokens.radii.md,
        chip: uiTokens.radii.sm
      },
      boxShadow: {
        panel: uiTokens.shadows.card
      }
    }
  },
  plugins: []
};
