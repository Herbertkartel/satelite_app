"use client";

import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import geotiff from "geotiff";

export default function Map({ imageUrls }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [opacity, setOpacity] = useState(1);
  const [layerInfo, setLayerInfo] = useState(null);
  const [availableLayers, setAvailableLayers] = useState([]);

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([0, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance.current);
    }

    async function fetchAndRenderImage(url) {
      try {
        const tiff = await geotiff.fromUrl(url);
        const image = await tiff.getImage();
        const raster = await image.readRasters();
        const [minX, minY, maxX, maxY] = image.getBounds();
        const canvas = document.createElement("canvas");
        canvas.width = image.getWidth();
        canvas.height = image.getHeight();
        const ctx = canvas.getContext("2d");

        const redBand = raster[0]; // Red
        const greenBand = raster[1]; // Green
        const blueBand = raster[2]; // Blue

        if (!redBand || !greenBand || !blueBand) {
          throw new Error("Missing RGB bands in GeoTIFF.");
        }

        for (let y = 0; y < image.getHeight(); y++) {
          for (let x = 0; x < image.getWidth(); x++) {
            const red = redBand[y * image.getWidth() + x];
            const green = greenBand[y * image.getWidth() + x];
            const blue = blueBand[y * image.getWidth() + x];

            const r = Math.min(Math.floor((red / 255) * 255), 255);
            const g = Math.min(Math.floor((green / 255) * 255), 255);
            const b = Math.min(Math.floor((blue / 255) * 255), 255);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }

        const imageUrl = canvas.toDataURL();

        const layer = L.imageOverlay(imageUrl, [[minY, minX], [maxY, maxX]]);
        layer.setOpacity(opacity).addTo(mapInstance.current);
        setAvailableLayers(prevLayers => [...prevLayers, { layer, url }]);

      } catch (error) {
        console.error("Error loading GeoTIFF from URL:", url, error);
      }
    }

    if (imageUrls && imageUrls.length > 0) { // Check if imageUrls is defined
      imageUrls.forEach(url => fetchAndRenderImage(url));
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [imageUrls, opacity]);

  const handleLayerChange = (url) => {
    const selected = availableLayers.find(layer => layer.url === url);
    if(selected) {
      if(selectedLayer) {
        selectedLayer.remove();
      }
      selected.layer.setOpacity(opacity).addTo(mapInstance.current);
      setSelectedLayer(selected.layer);
      setLayerInfo(url); // Set layer info (replace with actual metadata)
    }
  };

  return (
    <div>
      <div ref={mapRef} style={{ height: "600px", width: "100%" }} />
      <div>
        <select onChange={(e) => handleLayerChange(e.target.value)}>
          <option value="">Select Layer</option>
          {availableLayers.map(layer => (
            <option key={layer.url} value={layer.url}>{layer.url}</option>
          ))}
        </select>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
        />
        {layerInfo && <p>Layer Info: {layerInfo}</p>}
      </div>
    </div>
  );
}
