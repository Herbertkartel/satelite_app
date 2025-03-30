"use client"; // Ensure client-side rendering

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fromUrl } from "geotiff";
import { db } from "./firebase"; // Import Firebase
import { collection, getDocs } from "firebase/firestore"; // Firestore imports

export default function MapComponent() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [imageUrls, setImageUrls] = useState([]);

  // ✅ Fetch image URLs once
  useEffect(() => {
    const fetchImageUrls = async () => {
      try {
        const snapshot = await getDocs(collection(db, "satellite_images"));
        const urls = snapshot.docs.map(doc => {
          const rawUrl = doc.data().url;
          // Remove extra quotes or encoding issues
          return rawUrl.replace(/^%22|%22$/g, "").replace(/^"|"$/g, "");
        });

        if (urls.length === 0) throw new Error("No image URLs found");
        setImageUrls(urls);
      } catch (error) {
        console.error("Error fetching image URLs from Firestore:", error);
      }
    };

    fetchImageUrls();
  }, []); // ✅ Runs only on mount

  // ✅ Initialize map and render images
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView([0, 0], 2);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapInstance.current);
      }
    }

    async function fetchAndRenderImage(url) {
      try {
        const tiff = await fromUrl(url);
        const image = await tiff.getImage();
        const [minX, minY, maxX, maxY] = image.getBoundingBox();

        const canvas = document.createElement("canvas");
        canvas.width = image.getWidth();
        canvas.height = image.getHeight();
        const ctx = canvas.getContext("2d");

        const raster = await image.readRasters();
        const data = raster[0];

        for (let y = 0; y < image.getHeight(); y++) {
          for (let x = 0; x < image.getWidth(); x++) {
            const value = data[y * image.getWidth() + x];
            const color = Math.floor((value / 255) * 255);
            ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }

        const imageUrl = canvas.toDataURL();
        L.imageOverlay(imageUrl, [[minY, minX], [maxY, maxX]]).addTo(mapInstance.current);
      } catch (error) {
        console.error("Error loading GeoTIFF from URL:", url, error);
      }
    }

    // ✅ Render images when URLs are ready
    if (imageUrls.length > 0) {
      imageUrls.forEach(url => fetchAndRenderImage(url));
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [imageUrls]); // ✅ Triggered only when imageUrls change

  return <div ref={mapRef} style={{ height: "600px", width: "100%" }} />;
}
