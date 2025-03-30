// src/app/page.js
"use client"; // Ensure client-side rendering

import dynamic from "next/dynamic";

// Dynamically import map component
const MapComponent = dynamic(() => import("./map"), { ssr: false });

export default function HomePage() {
  return (
    <div>
      <h1>Satellite Image Viewer</h1>
      <MapComponent />
    </div>
  );
}


