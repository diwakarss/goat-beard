import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#FFFFFF',
        muted: '#F8FAFC',
        border: '#E2E8F0',
        accent: '#6366F1',
        'accent-light': '#EEF2FF',
        severity: {
          low: '#22C55E',
          medium: '#EAB308',
          high: '#F97316',
          critical: '#DC2626'
        },
        beard: {
          0: '#E2E8F0', // Clean Chin
          1: '#BBF7D0', // Wisp
          2: '#FDE68A', // Tuft
          3: '#FDBA74', // Billy Beard
          4: '#FCA5A5', // Knee-Dragger
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
