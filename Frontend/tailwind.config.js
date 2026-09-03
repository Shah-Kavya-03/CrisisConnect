/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#031726',
          slate: '#071E2B',
          navy: '#0B293A',
          primary: '#0891B2',
          cyan: '#06B6D4',
          teal: '#0F766E',
          accent: '#38BDF8',
          glow: '#22D3EE',
          emergency: '#EF4444',
          urgent: '#F97316',
          warning: '#F59E0B',
          success: '#10B981',
          light: '#F0F9FF',
          card: '#082535',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
