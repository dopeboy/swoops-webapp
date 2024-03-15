module.exports = {
    content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}', './node_modules/@tremor/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        transparent: 'transparent',
        current: 'currentColor',
        extend: {
            screens: {
                // 'pd-lg': '1003px',
                xs: '499px',
                md: '768px',
                'pd-xl': '800px',
                'pd-1.5xl': '1160px',
                'pd-2xl': '1204px',
                'navbar-gm-dropdown-break': '1400px',
                'navbar-font-resize': '1145px',
                'image-break': '1262px',
                '7xl': '2560px',
            },
            zIndex: {
                60: '60',
                70: '70',
            },
            spacing: {
                '1/2': '50%',
                '1/3': '33.333333%',
                '2/3': '66.666667%',
                '1/4': '25%',
                '2/4': '50%',
                '3/4': '75%',
                '1/5': '20%',
                '2/5': '40%',
                '3/5': '60%',
                '4/5': '80%',
                '1/6': '16.666667%',
                '2/6': '33.333333%',
                '3/6': '50%',
                '4/6': '66.666667%',
                '5/6': '83.333333%',
                '1/12': '8.333333%',
                '2/12': '16.666667%',
                '3/12': '25%',
                '4/12': '33.333333%',
                '5/12': '41.666667%',
                '6/12': '50%',
                '7/12': '58.333333%',
                '8/12': '66.666667%',
                '9/12': '75%',
                '10/12': '83.333333%',
                '11/12': '91.666667%',
                full: '100%',
            },
            scale: {
                '-100': '-1',
            },
            borderRadius: {
                swoops: '5px 5px 5px 5px',
                'tremor-small': '0.375rem',
                'tremor-default': '0.5rem',
                'tremor-full': '9999px',
            },
            fontFamily: {
                header: ['Druk wide bold', 'system-ui', 'sans-serif'],
                subheading: ['Druk wide medium', 'system-ui', 'sans-serif'],
                display: ['Inter extra bold', 'system-ui', 'san-serif'],
                body: ['Inter', 'system-ui', 'san-serif'],
            },
            boxShadow: {
                surround: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
                // light
                'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                'tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                // dark
                'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                'dark-tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'dark-tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
            colors: {
                black: '#282828',
                white: '#FDFDFD',
                'off-black': '#4E4E4E',
                blue: '#1DA1F2',
                'assist-green': '#13FF0D',
                'hard-green': '#216D20',
                'defeat-red': '#D81E5B',
                'defeat-red-text-on-black': '#E56E95',
                purple: '#6b21a8',
                'light-purple': '#e9d5ff',
                daily: '#5688FC',
                'daily-light': '#E4ECFF',
                weekly: '#D13DC2',
                'weekly-light': '#EFD4F1',
                'bi-seasonal': '#F44336',
                'bi-seasonal-light': '#F1D4D6',
                seasonal: '#F0CA00',
                'seasonal-light': '#F1EFD4',
                primary: '#8687F1',
                secondary: '#FF5705',
                tremor: {
                    brand: {
                        faint: '#eff6ff', // blue-50
                        muted: '#bfdbfe', // blue-200
                        subtle: '#60a5fa', // blue-400
                        DEFAULT: '#FDFDFD', // blue-500
                        emphasis: '#1d4ed8', // blue-700
                        inverted: '#ffffff', // white
                    },
                    background: {
                        muted: '#f9fafb', // gray-50
                        subtle: '#f3f4f6', // gray-100
                        DEFAULT: '#ffffff', // white
                        emphasis: '#374151', // gray-700
                    },
                    border: {
                        DEFAULT: '#e5e7eb', // gray-200
                    },
                    ring: {
                        DEFAULT: '#e5e7eb', // gray-200
                    },
                    content: {
                        subtle: '#9ca3af', // gray-400
                        DEFAULT: '#6b7280', // gray-500
                        emphasis: '#374151', // gray-700
                        strong: '#111827', // gray-900
                        inverted: '#ffffff', // white
                    },
                },
                // dark mode
                'dark-tremor': {
                    brand: {
                        faint: '#0B1229', // custom
                        muted: '#172554', // blue-950
                        subtle: '#1e40af', // blue-800
                        DEFAULT: '#FDFDFD', // white
                        emphasis: '#60a5fa', // blue-400
                        inverted: '#030712', // gray-950
                    },
                    background: {
                        muted: '#131A2B', // custom
                        subtle: '#1f2937', // gray-800
                        DEFAULT: '#282828', // gray-900
                        emphasis: '#d1d5db', // gray-300
                    },
                    border: {
                        DEFAULT: '#1f2937', // gray-800
                    },
                    ring: {
                        DEFAULT: '#1f2937', // gray-800
                    },
                    content: {
                        subtle: '#4b5563', // gray-600
                        DEFAULT: '#fdfdfd', // gray-500
                        emphasis: '#e5e7eb', // gray-200
                        strong: '#f9fafb', // gray-50
                        inverted: '#000000', // black
                    },
                },
            },
            inset: {
                46: '184px',
            },
            opacity: {
                4: '.04',
                8: '.08',
                16: '.16',
                32: '.32',
                64: '.64',
            },
            borderWidth: {
                1: '1px',
                5: '5px',
                6: '6px',
            },
            strokeWidth: {
                3: '3',
                4: '4',
            },
            fontSize: {
                '3xl': '1.953rem',
                '4xl': '2.441rem',
                '5xl': '3.052rem',
                '2xl': [
                    '32px',
                    {
                        letterSpacing: '150%',
                        lineHeight: '48px',
                    },
                ],
                xl: [
                    '24px',
                    {
                        letterSpacing: '150%',
                        lineHeight: '36px',
                    },
                ],
                lg: [
                    '16px',
                    {
                        letterSpacing: '150%',
                        lineHeight: '24px',
                    },
                ],
                base: [
                    '14px',
                    {
                        letterSpacing: '150%',
                        lineHeight: '21px',
                    },
                ],
                sm: [
                    '11px',
                    {
                        letterSpacing: '150%',
                        lineHeight: '21px',
                    },
                ],
                'tremor-label': ['0.75rem'],
                'tremor-default': ['0.875rem', { lineHeight: '1.25rem' }],
                'tremor-title': ['1.125rem', { lineHeight: '1.75rem' }],
                'tremor-metric': ['1.875rem', { lineHeight: '2.25rem' }],
            },
        },
    },
    safelist: [
        {
            pattern:
                /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ['hover', 'ui-selected'],
        },
        {
            pattern:
                /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ['hover', 'ui-selected'],
        },
        {
            pattern:
                /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ['hover', 'ui-selected'],
        },
        {
            pattern:
                /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
        },
        {
            pattern:
                /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
        },
        {
            pattern:
                /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
        },
    ],
    plugins: [require('@tailwindcss/forms'), require('@headlessui/tailwindcss')],
};
