import { createContext, useState, useContext, useEffect } from 'react';
import { themes, applyTheme } from '../lib/themes';

const PortfolioContext = createContext();

export const PortfolioProvider = ({ initialData, children }) => {
    const [portfolio, setPortfolio] = useState(initialData);
    const [isEditing, setIsEditing] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const themeName = portfolio?.theme || themes[0].name;
    const currentTheme = themes.find(t => t.name === themeName) || themes[0];

    useEffect(() => {
        applyTheme(currentTheme, darkMode);
    }, [currentTheme, darkMode]);

    const updateSectionContent = (sectionName, content) => {
        setPortfolio(prev => ({
            ...prev,
            sections: prev.sections.map(sec =>
                sec.section === sectionName ? { ...sec, content } : sec
            )
        }));
    };

    const toggleDarkMode = () => setDarkMode(dm => !dm);

    const setTheme = (themeName) => {
        setPortfolio(prev => ({ ...prev, theme: themeName }));
    };

    return (
        <PortfolioContext.Provider value={{ 
            portfolio, 
            updateSectionContent, 
            isEditing, 
            setIsEditing,
            darkMode,
            toggleDarkMode,
            themes,
            currentTheme,
            setTheme,
            setPortfolio
        }}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = () => useContext(PortfolioContext);
