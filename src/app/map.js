import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fromUrl } from 'geotiff';
import { db } from './firebase'; // Import Firebase
import { collection, getDocs } from 'firebase/firestore'; // Updated Firestore modular imports

export default function MapComponent() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    // Initialize the map only on the client-side (since window is not defined in SSR)
    if (typeof window !== 'undefined') {
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance.current);
      }
    }

    // Fetch image URLs from Firebase Firestore
    const fetchImageUrls = async () => {
      try {
        // Use Firestore modular API
        const snapshot = await getDocs(collection(db, 'imageUrls'));
        const urls = snapshot.docs.map(doc => doc.data().url); // Assuming each document has a 'url' field
        setImageUrls(urls);
      } catch (error) {
        console.error('Error fetching image URLs from Firestore:', error);
      }
    };

    fetchImageUrls();

    async function fetchAndRenderImage(url) {
      console.log('Fetching GeoTIFF from URL:', url);
      try {
        const tiff = await fromUrl(url);
        const image = await tiff.getImage();
        const [minX, minY, maxX, maxY] = image.getBoundingBox();

        const canvas = document.createElement('canvas');
        canvas.width = image.getWidth();
        canvas.height = image.getHeight();
        const ctx = canvas.getContext('2d');

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

    // Render the first image URL from the state if available
    if (imageUrls.length > 0) {
      fetchAndRenderImage(imageUrls[0]);
    } else {
      console.error('No image URLs provided or the provided value is not an array');
    }

    return () => {
      // Cleanup map instance on unmount
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [imageUrls]); // Dependency on imageUrls

  return <div ref={mapRef} style={{ height: '600px', width: '100%' }} />;
}
