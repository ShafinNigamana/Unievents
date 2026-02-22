import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { getInitialTheme, applyTheme } from "./context/theme";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Apply theme before render
const theme = getInitialTheme();
applyTheme(theme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
