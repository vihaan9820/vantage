import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  switchable = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vantage-theme") || localStorage.getItem("skillswap-theme") || localStorage.getItem("theme");
      if (switchable && (stored === "light" || stored === "dark")) return stored;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    const active = switchable ? theme : "dark";
    root.setAttribute("data-theme", active);
    root.setAttribute("data-skillswap-theme", active);
    if (active === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    }
    if (switchable) {
      try {
        localStorage.setItem("vantage-theme", active);
        localStorage.setItem("skillswap-theme", active);
        localStorage.setItem("theme", active);
      } catch {}
    } else {
      try {
        localStorage.setItem("vantage-theme", "dark");
        localStorage.setItem("skillswap-theme", "dark");
        localStorage.setItem("theme", "dark");
      } catch {}
    }
  }, [theme, switchable]);

  const toggleTheme = () => {
    if (!switchable) return;
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    if (!switchable) return;
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: switchable ? theme : "dark", setTheme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "dark" as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
      switchable: false,
    };
  }
  return context;
}

