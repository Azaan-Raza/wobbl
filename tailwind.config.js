/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F5F5', // page background
        ink: '#000000', // text and linework
        graphite: '#303030', // dark pill buttons
        line: '#626262', // button outlines
        hairline: '#DCDCDC', // window borders and dividers
        muted: '#5E5E5E', // secondary text (6:1 on paper)
        chrome: '#ECECEC', // window title bars
        stage: '#151515', // camera stage behind the video
        accent: '#00E07A', // pose overlay and live indicators, used inside the product only
        'accent-ink': '#007A3D', // accent when it has to sit on paper as text
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        hand: ['Caveat', 'ui-rounded', 'cursive'], // handwritten notes only
      },
      fontSize: {
        hero: ['clamp(3rem, 8.2vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.045em' }],
        section: ['clamp(2.25rem, 5vw, 3.5rem)', { lineHeight: '1', letterSpacing: '-0.035em' }],
        lead: ['1.25rem', { lineHeight: '1.6' }],
      },
      borderRadius: {
        window: '16px',
      },
      boxShadow: {
        float: '0 10px 24px 0 rgba(0, 0, 0, 0.12)',
        window: '0 24px 60px -12px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.06)',
      },
      maxWidth: {
        page: '72rem',
      },
    },
  },
  plugins: [],
};
