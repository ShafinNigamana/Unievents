import { createContext, useContext, useState } from "react";
import { getInitialTheme, applyTheme } from "./theme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
