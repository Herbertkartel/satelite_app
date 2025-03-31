"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./map"), { ssr: false });

export default function HomePage() {
  const imageUrls = [
    "https://yourserver.com/path/to/geotiff1.tif",
    "https://yourserver.com/path/to/geotiff2.tif",
    // Add more URLs here
  ];

  return (
    <div>
      <h1>Satellite Image Viewer</h1>
      <MapComponent imageUrls={imageUrls} />
    </div>
  );
}
