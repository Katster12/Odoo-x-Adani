module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          500: '#4f46e5',
        },
        industrial: {
          50: '#f6f7f8',
          100: '#e9eef2',
          200: '#cfd8de',
          400: '#7691a0',
          600: '#334155',
          700: '#1f2a33',
          900: '#0b1014'
        },
        accent: {
          indigo: '#5b6bff',
          orange: '#ff7a18'
        }
      },
      boxShadow: {
        'panel': '0 6px 18px rgba(2,6,23,0.45)',
        'soft': '0 4px 12px rgba(2,6,23,0.35)'
      },
      borderRadius: {
        'lg-2': '14px'
      }
    }
  },
  plugins: [],
}