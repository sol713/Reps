import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const THEME_KEY = "reps-theme";
const THEME_COLORS = {
  light: "#FFFFFF",
  dark: "#000000"
};

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(THEME_KEY);
}

function updateMetaThemeColor(theme) {
  const color = THEME_COLORS[theme];
  let metaThemeColor = document.querySelector('meta[name="theme-color"]:not([media])');
  
  if (!metaThemeColor) {
    metaThemeColor = document.createElement("meta");
    metaThemeColor.setAttribute("name", "theme-color");
    document.head.appendChild(metaThemeColor);
  }
  
  metaThemeColor.setAttribute("content", color);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = getStoredTheme();
    if (stored === "light" || stored === "dark") return stored;
    return getSystemTheme();
  });

  const [isSystem, setIsSystem] = useState(() => {
    const stored = getStoredTheme();
    return stored !== "light" && stored !== "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    updateMetaThemeColor(theme);
  }, [theme]);

  useEffect(() => {
    if (!isSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e) => {
      setThemeState(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isSystem]);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === "system") {
      localStorage.removeItem(THEME_KEY);
      setIsSystem(true);
      setThemeState(getSystemTheme());
    } else {
      localStorage.setItem(THEME_KEY, newTheme);
      setIsSystem(false);
      setThemeState(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }, [theme, setTheme]);

  const value = {
    theme,
    isSystem,
    isDark: theme === "dark",
    isLight: theme === "light",
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
