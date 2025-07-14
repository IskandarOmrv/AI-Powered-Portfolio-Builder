
export const themes = [
    {
        name: 'Slate',
        hsl: {
            light: {
                background: '210 20% 98%',
                primary: '215 28% 32%',
                accent: '160 84% 39%'
            },
            dark: {
                background: '215 28% 12%',
                primary: '210 20% 90%',
                accent: '160 84% 60%'
            }
        }
    },
    {
        name: 'Forest',
        hsl: {
            light: { background: '120 10% 95%', primary: '140 40% 40%', accent: '100 30% 60%' },
            dark: { background: '140 10% 10%', primary: '140 40% 60%', accent: '100 30% 40%' },
        },
    },
    {
        name: 'Sunset',
        hsl: {
            light: {
                background: '45 100% 97%',
                primary: '25 95% 53%',
                accent: '330 81% 60%'
            },
            dark: {
                background: '25 30% 10%',
                primary: '45 100% 85%',
                accent: '330 81% 75%'
            }
        }
    },
    {
        name: 'Ocean',
        hsl: {
            light: {
                background: '195 50% 96%',
                primary: '205 80% 40%',
                accent: '180 80% 45%'
            },
            dark: {
                background: '210 30% 8%',
                primary: '195 80% 60%',
                accent: '170 80% 55%'
            }
        }
    },
    {
        name: 'Royal',
        hsl: {
            light: {
                background: '240 20% 96%',
                primary: '260 50% 45%',
                accent: '300 60% 50%'
            },
            dark: {
                background: '240 20% 10%',
                primary: '270 60% 65%',
                accent: '310 70% 65%'
            }
        }
    },
    {
        name: 'Earth',
        hsl: {
            light: {
                background: '40 30% 95%',
                primary: '25 50% 40%',
                accent: '50 70% 50%'
            },
            dark: {
                background: '30 20% 10%',
                primary: '35 50% 65%',
                accent: '45 80% 65%'
            }
        }
    },
    {
        name: 'Neon',
        hsl: {
            light: {
                background: '300 10% 96%',
                primary: '320 80% 50%',
                accent: '200 90% 55%'
            },
            dark: {
                background: '270 20% 8%',
                primary: '320 100% 70%',
                accent: '190 100% 65%'
            }
        }
    },
    {
        name: 'Steel',
        hsl: {
            light: {
                background: '220 10% 94%',
                primary: '220 15% 35%',
                accent: '200 30% 50%'
            },
            dark: {
                background: '220 15% 12%',
                primary: '220 20% 80%',
                accent: '200 40% 65%'
            }
        }
    },
    {
        name: 'Blossom',
        hsl: {
            light: {
                background: '350 50% 96%',
                primary: '340 60% 45%',
                accent: '10 80% 60%'
            },
            dark: {
                background: '340 20% 10%',
                primary: '350 70% 75%',
                accent: '20 90% 70%'
            }
        }
    },
    {
        name: 'Mint',
        hsl: {
            light: {
                background: '160 40% 96%',
                primary: '170 60% 35%',
                accent: '140 80% 45%'
            },
            dark: {
                background: '170 30% 8%',
                primary: '160 50% 65%',
                accent: '150 70% 55%'
            }
        }
    }
];





export const applyTheme = (theme, darkMode = false) => {
    const root = document.documentElement;
    const colors = darkMode ? theme.hsl.dark : theme.hsl.light;

    // Core colors
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', darkMode ? '0 0% 98%' : '224 71% 4%');
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--accent', colors.accent);

    // Derived colors
    root.style.setProperty('--card', darkMode ? '215 19% 15%' : '0 0% 100%');
    root.style.setProperty('--card-foreground', darkMode ? '0 0% 98%' : '224 71% 4%');
    root.style.setProperty('--border', darkMode ? '215 19% 30%' : '215 19% 76%');
    root.style.setProperty('--input-bg', darkMode ? '215 19% 20%' : '0 0% 95%');
    root.style.setProperty('--input-text', darkMode ? '0 0% 98%' : '224 71% 4%');
    root.style.setProperty('--input-border', darkMode ? '215 19% 40%' : '215 19% 60%');
    root.style.setProperty('--muted-foreground', darkMode ? '215 19% 65%' : '215 19% 45%');
    root.style.setProperty('--shadow-color', darkMode ? '0 0% 0%' : '215 19% 20%');

    // Header specific
    root.style.setProperty('--header-bg', colors.background);
    root.style.setProperty('--header-text', colors.primary);
    root.style.setProperty('--header-subtext', colors.accent);
    root.style.setProperty('--header-shadow', darkMode ? '0 0% 0%' : '215 19% 20%');

    // Editor specific
    root.style.setProperty('--editor-bg', darkMode ? '215 19% 12%' : '0 0% 100%');

    // Set theme attribute
    root.setAttribute('data-theme', theme.name.toLowerCase());
    root.classList.toggle('dark', darkMode);
    root.style.setProperty('--card-bg', darkMode ? '220 14% 18%' : '0 0% 100%');
    root.style.setProperty('--card-text', darkMode ? '220 10% 85%' : '220 14% 30%');

    root.style.setProperty('--section-bg', darkMode ? '220 14% 16%' : '0 0% 98%');
    root.style.setProperty('--section-heading', darkMode ? '0 0% 95%' : '220 14% 20%');
    root.style.setProperty('--section-text', darkMode ? '220 10% 80%' : '220 14% 35%');

    root.style.setProperty('--destructive', '0 100% 50%')

    root.style.setProperty('--contact-bg', darkMode ? '215 19% 8%' : '210 20% 98%');
    root.style.setProperty('--contact-text', darkMode ? '0 0% 95%' : '224 71% 15%');
    root.style.setProperty('--contact-hover', darkMode ? '215 19% 20%' : '210 20% 90%');

    root.style.setProperty('--projects-bg',
        darkMode
            ? adjustLightness(theme.hsl.dark.background, 3) // 5% lighter than main bg
            : adjustLightness(theme.hsl.light.background, -3) // 3% darker than main bg
    );


    function adjustLightness(hslStr, percent) {
        const [h, s, l] = hslStr.split(' ').map(v => parseFloat(v));
        return `${h} ${s}% ${Math.min(100, Math.max(0, l + percent))}%`;
    }

};