'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// --- Custom Icons ---
const createIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const hospitalIcon = createIcon('#2563EB'); // Blue
const pharmacyIcon = createIcon('#10B981'); // Green

// --- Map Controller (Handles Events) ---
function MapController({ onBoundsChange, selectedId, center }: any) {
  const map = useMap();

  // 1. Initial Load: Report bounds immediately so data loads
  useEffect(() => {
    if (map) {
      const bounds = map.getBounds();
      onBoundsChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    }
  }, [map, onBoundsChange]);

  // 2. Fly to location when selected
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 15, { duration: 1.5 });
    }
  }, [center, map, selectedId]);

  // 3. Detect movement
  useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    },
  });

  return null;
}

export default function Map({ center, markers, selectedId, onSelect, onBoundsChange }: any) {
  return (
    <MapContainer
      center={[6.9271, 79.8612]} // Default: Colombo
      zoom={14}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController 
        onBoundsChange={onBoundsChange} 
        selectedId={selectedId} 
        center={center} 
      />

      {markers.map((item: any) => (
        <Marker
          key={item.id}
          position={[item.coordinates.lat, item.coordinates.lng]}
          icon={item.type === 'Hospital' ? hospitalIcon : pharmacyIcon}
          eventHandlers={{ click: () => onSelect(item.id) }}
        >
          <Popup>
            <div className="p-1">
              <strong className="block text-sm font-bold">{item.name}</strong>
              <span className="text-xs text-slate-500">{item.type}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}