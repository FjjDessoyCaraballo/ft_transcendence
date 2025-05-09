/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  "./src/**/*.{js,jsx,ts,tsx}",
	  "./public/**/*.html",
	  "./src/**/*.{html,js,jsx,ts,tsx}",
	  "./src/UI/**/*.{js,jsx,ts,tsx}",  // Specifically include your UI components
	],
	safelist: [
	  'fixed',
	  'inset-0',
	  'z-50',
	  'z-[9999]',
	  'flex',
	  'items-center',
	  'justify-center',
	  'bg-black',
	  'bg-opacity-50'
	],
	theme: {
	  extend: {
		colors: {
		  // Game-specific colors
		  'game-orange': '#845132',
		  'game-text': '#020200',
		  'button-default': '#FFFFF0',
		  'button-hover': '#D4D2B6',
		},
		fontFamily: {
		  'arial': ['Arial', 'sans-serif'],
		  'impact': ['Impact', 'sans-serif'],
		  'mono': ['Mono','sans-serif']
		},
		zIndex: {
		  '100': '100',
		  '1000': '1000',
		  '9999': '9999',
		}
	  }
	},
	plugins: [],
	// Important: make sure Tailwind doesn't purge the styles used in your GDPR component
	// This is particularly important for dynamically rendered components
	corePlugins: {
	  preflight: true,
	}
  }