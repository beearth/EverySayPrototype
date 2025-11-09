import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";         // 같은 폴더
import "./index.css";                // 있으면 유지, 없으면 이 줄 지워도 됨

createRoot(document.getElementById("root")).render(<App />);
