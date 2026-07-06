import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/styles/index.css";
import { initTheme } from "./shared/theme/theme";
import { App } from "./app/App";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
