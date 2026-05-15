/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom MeetLoom color palette inspired by Anthropic
        'meetloom': {
          'bg-main': '#FAF9F5',    // Soft cream
          'bg-soft': '#E8E6DC',    // Lighter neutral
          'text-dark': '#141413',  // Deep charcoal
          'accent': '#D97757',     // Warm terracotta
          'muted': '#B0AEA5',      // Muted gray
        },
      },
      fontFamily: {
        'sans': ['system-ui', 'sans-serif'],
      },
      spacing: {
        'xl': '2rem',
        'xxl': '3rem',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
