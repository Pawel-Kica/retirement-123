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
                    // Primary Colors (ZUS Design System)
                    green: '#00843D',
                    'green-dark': '#006B32',
                    'green-light': '#F0F8F4',

                    // Secondary Colors
                    navy: '#0B4C7C',
                    'navy-dark': '#083A5F',
                    blue: '#0088CC',
                    orange: '#F5A623',
                    'orange-dark': '#E89512',
                    teal: '#00A99D',

                    // Utility Colors
                    error: '#D32F2F',
                    warning: '#F5A623',
                    success: '#00843D',
                    info: '#0B4C7C',

                    // Grey Scale
                    'grey-900': '#212121',
                    'grey-700': '#424242',
                    'grey-500': '#757575',
                    'grey-300': '#E0E0E0',
                    'grey-100': '#F5F5F5',

                    // Semantic Aliases (for backward compatibility and easier use)
                    primary: '#00843D',       // Green (main brand color)
                    secondary: '#0B4C7C',     // Navy (secondary actions)
                    accent: '#F5A623',        // Orange (CTAs)
                    border: '#E0E0E0',        // Grey 300

                    // Legacy aliases (for gradual migration)
                    amber: '#F5A623',
                    gray: '#E0E0E0',
                    red: '#D32F2F',
                    black: '#212121',
                },
            },
        },
    },
    plugins: [],
};

export default config;

