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
          dark: '#0F172A',
          navy: '#1E293B',
          primary: '#2563EB',
          accent: '#0284C7',
          emergency: '#DC2626',
          urgent: '#EA580C',
          warning: '#D97706',
          success: '#16A34A',
          light: '#F8FAFC',
          card: '#FFFFFF',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
