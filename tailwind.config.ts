import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                zus: {
                    amber: 'rgb(255,179,79)',
                    green: 'rgb(0,153,63)',
                    gray: 'rgb(190,195,206)',
                    blue: 'rgb(63,132,210)',
                    navy: 'rgb(0,65,110)',
                    red: 'rgb(240,94,94)',
                    black: 'rgb(0,0,0)',
                },
            },
        },
    },
    plugins: [],
};

export default config;

