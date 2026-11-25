/** @type {import('tailwindcss').Config} */
// wobbl brand tokens. BRAND.md explains each one.
export default {
  content: ['./index.html', './try/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFFFFF', // page background
        ink: '#141414', // text, primary buttons
        muted: '#5B5B58', // secondary text (6.8:1 on paper)
        rule: '#E5E5E1', // borders and dividers
        line: '#C9C9C4', // input borders, stronger dividers
        mist: '#F4F4F1', // product stages, alternate bands
        screen: '#141414', // behind live camera video
        cobalt: { DEFAULT: '#2346F5', deep: '#1A36C4', wash: '#EEF1FE' }, // brand: tracked, in range, links
        signal: { DEFAULT: '#D13A22', wash: '#FCEEEB' }, // the wobble: faults only
      },
      fontFamily: {
        sans: ['"Archivo Variable"', 'Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(2.6rem, 6.2vw, 4.25rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        section: ['clamp(2rem, 4.2vw, 3rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        lead: ['1.1875rem', { lineHeight: '1.55' }],
        body: ['1.0625rem', { lineHeight: '1.6' }],
      },
      maxWidth: {
        page: '75rem',
      },
    },
  },
  plugins: [],
};
