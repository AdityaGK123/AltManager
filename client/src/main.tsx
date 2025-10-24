import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeAccessibility } from "./utils/accessibility";

// Initialize accessibility features early in the application lifecycle
initializeAccessibility();

createRoot(document.getElementById("root")!).render(<App />);
