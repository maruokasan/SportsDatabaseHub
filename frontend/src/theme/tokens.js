// src/theme/tokens.js
// Centralized design tokens derived from doc/ui-ux-hub.md so UI + theming stay in sync.

export const uiTokens = {
  colors: {
    background: '#0F1115',
    surface: '#171A21',
    surfaceRaised: '#1E222B',
    border: '#252A33',
    text: '#E8ECF3',
    textMuted: '#8B9AB7',
    accent: '#15B097',
    accentMuted: '#0E7566',
    info: '#3A7BFF',
    warning: '#F4B93C',
    danger: '#FF6B6B',
    success: '#21D69B'
  },
  typography: {
    display: {
      fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
      fontWeight: 600,
      fontSize: '40px',
      lineHeight: '44px'
    },
    sectionTitle: {
      fontFamily: '"Inter", system-ui, sans-serif',
      fontWeight: 600,
      fontSize: '20px',
      lineHeight: '28px'
    },
    body: {
      fontFamily: '"Inter", system-ui, sans-serif',
      fontWeight: 400,
      fontSize: '16px',
      lineHeight: '24px'
    },
    dataLabel: {
      fontFamily: '"IBM Plex Mono", "Space Mono", ui-monospace, SFMono-Regular, monospace',
      fontWeight: 500,
      fontSize: '12px',
      lineHeight: '18px'
    }
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '24px',
    6: '32px',
    7: '48px'
  },
  radii: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  shadows: {
    card: '0 24px 60px rgba(4, 6, 9, 0.45)',
    inset: 'inset 0 1px 0 rgba(255,255,255,0.05)'
  },
  transitions: {
    subtle: '150ms ease-out',
    panel: '250ms ease-in-out'
  },
  layout: {
    gridColumns: 12,
    gutters: {
      desktop: 24,
      tablet: 16,
      mobile: 12
    }
  },
  focusRing: '0 0 0 2px rgba(58, 123, 255, 0.6)'
};

export default uiTokens;
