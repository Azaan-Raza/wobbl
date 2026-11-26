/** @type {import('tailwindcss').Config} */
// wobbl brand tokens. BRAND.md explains each one.
export default {
  content: ['./index.html', './try/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFFFFF', // page background
        ink: '#16161B', // text, dark buttons
        muted: '#62626B', // secondary text
        rule: '#EBEBEF', // hairlines and card borders
        line: '#D6D6DC', // input borders, chart baselines
        mist: '#F5F5F7', // quiet card and band backgrounds
        night: '#0C0D12', // camera stage and dark sections
        screen: '#0C0D12', // behind live camera video
        cobalt: { DEFAULT: '#2346F5', deep: '#1A36C4', wash: '#EEF1FE', light: '#8EA2FF' }, // brand
        signal: { DEFAULT: '#D13A22', bright: '#FF5A3D', wash: '#FCEEEB' }, // faults only
      },
      fontFamily: {
        sans: ['"Instrument Sans Variable"', '"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Newsreader Variable"', 'Newsreader', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        hero: ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.025em' }],
        section: ['clamp(2.25rem, 4.6vw, 3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        title: ['clamp(1.5rem, 2.4vw, 2rem)', { lineHeight: '1.12', letterSpacing: '-0.015em' }],
        lead: ['1.1875rem', { lineHeight: '1.55' }],
        body: ['1rem', { lineHeight: '1.6' }],
      },
      maxWidth: {
        page: '76rem',
      },
      borderRadius: {
        card: '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,16,24,0.05), 0 8px 24px -12px rgba(16,16,24,0.12)',
        lift: '0 1px 2px rgba(16,16,24,0.06), 0 24px 48px -20px rgba(16,16,24,0.28)',
        window: '0 2px 6px rgba(10,12,30,0.10), 0 40px 100px -24px rgba(10,12,40,0.55)',
        glow: '0 10px 30px -8px rgba(35,70,245,0.6), inset 0 1px 0 rgba(255,255,255,0.28)',
      },
    },
  },
  plugins: [],
};
