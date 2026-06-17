/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07080a',
          900: '#0B0C10',
          800: '#151A22',
          700: '#1F2833',
          600: '#2B3544',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F3E5AB',
          dark: '#AA7C11',
        },
        neon: {
          cyan: '#00F0FF',
          purple: '#BD00FF',
          pink: '#FF007F',
          gold: '#FFD700',
          emerald: '#00FF87',
        }
      },
      backgroundImage: {
        'glass-glow': 'radial-gradient(circle at 50% 50%, rgba(189, 0, 255, 0.15), transparent 60%)',
        'cyber-gradient': 'linear-gradient(135deg, #BD00FF 0%, #00F0FF 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.3)',
        'neon-purple': '0 0 15px rgba(189, 0, 255, 0.3)',
        'neon-pink': '0 0 15px rgba(255, 0, 127, 0.3)',
        'neon-emerald': '0 0 15px rgba(0, 255, 135, 0.3)',
        'neon-gold': '0 0 15px rgba(255, 215, 0, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
