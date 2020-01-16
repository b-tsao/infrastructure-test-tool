import React, { useState } from "react";
import { Route, BrowserRouter as Router } from "react-router-dom";

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

/* Import Components */
import Main from "./landing/Main";

import { ThemeContext, MainDisplayContext } from "./Contexts";

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
        <MainDisplayContext.Provider value={useState("home")}>
          <CssBaseline />
          <Router>
            <Route exact path="/" component={Main} />
          </Router>
        </MainDisplayContext.Provider>
      </ThemeContext.Provider>
    </MuiThemeProvider>
  );
}

