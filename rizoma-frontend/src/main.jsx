import { Buffer } from "buffer";
window.Buffer = Buffer;

import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./AppRoutes";

import "@solana/wallet-adapter-react-ui/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppRoutes />
);