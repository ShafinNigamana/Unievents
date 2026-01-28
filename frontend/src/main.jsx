import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { getInitialTheme, applyTheme } from "./context/theme";

const theme = getInitialTheme();
applyTheme(theme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
