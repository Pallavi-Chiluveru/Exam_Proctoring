/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#030712',
        panel: 'rgba(10, 15, 31, 0.72)',
        line: 'rgba(255, 255, 255, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 80px rgba(45, 212, 191, 0.16)',
        glass: '0 24px 90px rgba(0, 0, 0, 0.34)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at 18% 10%, rgba(20,184,166,.22), transparent 28%), radial-gradient(circle at 88% 4%, rgba(56,189,248,.18), transparent 24%), linear-gradient(135deg, #030712 0%, #08111f 45%, #050816 100%)',
      },
    },
  },
  plugins: [],
};
