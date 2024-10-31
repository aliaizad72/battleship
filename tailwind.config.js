/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,js}", "./index.html"],
	theme: {
		extend: {
			colors: {
				"neon-blue": "#55ffff",
				"dark-blue": "#5555ff",
				"neon-pink": "#ff55ff",
				"neon-green": "#55ff55",
				"neon-red": "#ff5555",
			},
		},
	},
	plugins: [],
};
