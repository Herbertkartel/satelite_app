// src/app/page.js
"use client"; // Ensure this file is treated as a client-side component

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component with SSR disabled
const MapComponent = dynamic(() => import('./map'), { ssr: false });

export default function HomePage() {
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    // Simulate fetching image URLs (replace this with actual fetching logic from Firebase)
    const fetchedUrls = [
      'https://example.com/image1.tiff',
      'https://example.com/image2.tiff',
    ];
    setImageUrls(fetchedUrls);
  }, []);

  return (
    <div>
      <h1>Satellite Image Viewer</h1>
      {/* Render MapComponent only on the client-side */}
      <MapComponent imageUrls={imageUrls} />
    </div>
  );
}

