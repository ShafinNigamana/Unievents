import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { getInitialTheme, applyTheme } from "./context/theme";
import { AuthProvider } from "./context/AuthContext";

// Apply theme before render
const theme = getInitialTheme();
applyTheme(theme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
