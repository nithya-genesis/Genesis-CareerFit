/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        genesis: {
          gold: '#FFD000',
          goldHover: '#E5BB00',
          goldLight: '#FFFBEB',
          goldMuted: '#FEF08A',
          black: '#0A0A0A',
          darkSurface: '#171717',
          darkCard: '#1F1F1F',
          canvas: '#F7F7F5',
          card: '#FFFFFF',
          border: '#E5E7EB',
          borderDark: '#27272A',
          muted: '#6B7280',
          mutedDark: '#9CA3AF',
          success: '#16A34A',
          successLight: '#DCFCE7',
          warning: '#D97706',
          warningLight: '#FEF3C7',
          error: '#DC2626',
          errorLight: '#FEE2E2',
          neutral: '#71717A',
          neutralLight: '#F4F4F5',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'gold-glow': '0 0 15px -3px rgba(255, 208, 0, 0.35)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      }
    },
  },
  plugins: [],
}