/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        royal: {
          blue: '#0B1437',
          purple: '#1B0B37',
          gold: '#C6A355',
          dark: {
            DEFAULT: '#080B1A',
            card: '#0F1428',
            lighter: '#1A2138'
          }
        },
        surface: {
          light: '#0F1428',
          dark: '#080B1A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#fff',
            a: {
              color: '#C6A355',
              '&:hover': {
                color: '#C6A355',
                opacity: 0.8,
              },
            },
            h1: {
              color: '#fff',
            },
            h2: {
              color: '#fff',
            },
            h3: {
              color: '#fff',
            },
            h4: {
              color: '#fff',
            },
            strong: {
              color: '#fff',
            },
            code: {
              color: '#fff',
            },
            blockquote: {
              color: '#999',
              borderLeftColor: '#C6A355',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};