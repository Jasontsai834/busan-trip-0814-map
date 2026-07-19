import React from "react";
import { createRoot } from "react-dom/client";
import { TripMap } from "../app/trip-map";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TripMap />
  </React.StrictMode>,
);

