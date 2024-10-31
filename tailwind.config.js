/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,js}", "./index.html"],
	theme: {
		extend: {
			colors: {
				"neon-blue": "#55ffff",
				"dark-blue": "#5555ff",
				"neon-yellow": "#ff55ff",
			},
		},
	},
	plugins: [],
};
