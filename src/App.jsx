import React, { useState } from "react";

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

/* Import Components */
import Main from "./landing/Main";

import { ThemeContext } from "./Contexts";

export default function App() {
  const themeMode = localStorage.getItem("themeMode");

  const [theme, setTheme] = useState({
    palette: {
      type: themeMode ? themeMode : "light"
    }
  });

  const toggleTheme = () => {
    const newPaletteType = theme.palette.type === "light" ? "dark" : "light";
    setTheme({
      palette: {
        type: newPaletteType
      }
    });
    localStorage.setItem("themeMode", newPaletteType);
  };

  const muiTheme = createMuiTheme(theme);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeContext.Provider value={[theme, toggleTheme]}>
        <CssBaseline />
        <Main />
      </ThemeContext.Provider>
    </MuiThemeProvider>
  );
}

