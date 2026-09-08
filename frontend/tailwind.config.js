/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sylitheDark: '#191919', // Claude ink
        sylitheGreen: '#A3E635', // Lime green
        // Claude palette — internal dashboard chrome only. Map/legend colours
        // stay on the Dynamic World + ESA WorldCover values (see index.css).
        claude: {
          clay:       'var(--claude-clay)',
          clayStrong: 'var(--claude-clay-strong)',
          clayHover:  'var(--claude-clay-hover)',
          clayTint:   'var(--claude-clay-tint)',
          ink:        'var(--claude-ink)',
          inkMuted:   'var(--claude-ink-muted)',
          cream:      'var(--claude-cream)',
          surface:    'var(--claude-surface)',
          border:     'var(--claude-border)',
        },
        "background-100": "var(--ds-background-100)",
        "success": "var(--geist-success)",
        "error": "var(--geist-error)",
        "warning": "var(--geist-warning)",
        "violet": "var(--geist-violet)",
        "foreground": "var(--geist-foreground)",
      },
      fontFamily: {
        sans: ['var(--font-body)', 'DM Sans', 'sans-serif'],
        heading: ['var(--font-heading)', 'Space Grotesk', 'sans-serif'],
        mono: ['var(--font-mono)', 'DM Mono', 'monospace'],
      },
      keyframes: {
        arrowFloat: {
          '0%, 100%': { transform: 'translateX(0px)', opacity: '0.7' },
          '50%': { transform: 'translateX(6px)', opacity: '1' },
        },
      },
      animation: {
        'arrow-float': 'arrowFloat 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}