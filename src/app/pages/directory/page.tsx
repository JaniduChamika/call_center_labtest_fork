'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { 
  Search, MapPin, Building2, Stethoscope, 
  Navigation, Star, Clock, ArrowRight, Loader2, RefreshCw, CheckCircle2 
} from 'lucide-react';
import 'leaflet/dist/leaflet.css'; 

const MapComponent = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-full bg-slate-100 flex items-center justify-center text-slate-400">Loading Map...</div>
});

interface LocationItem {
  id: number;
  type: 'Hospital' | 'Pharmacy';
  name: string;
  address: string;
  phone: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  open: string;
}

export default function DirectoryPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Hospital' | 'Pharmacy'>('All');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);

  // --- 1. Fetch Data (Overpass API) ---
  const fetchPlaces = useCallback(async (bounds: any) => {
    if (!bounds) return;
    setIsLoading(true);

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        node["amenity"="pharmacy"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      );
      out center 50;
    `;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: "data=" + encodeURIComponent(query),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();

      if (data.elements) {
        const formatted: LocationItem[] = data.elements.map((el: any) => ({
          id: el.id,
          type: el.tags.amenity === 'hospital' ? 'Hospital' : 'Pharmacy',
          name: el.tags.name || 'Unknown Location',
          address: el.tags['addr:street'] ? `${el.tags['addr:street']}` : 'Sri Lanka',
          phone: el.tags['phone'] || '+94 11 000 0000',
          coordinates: { lat: el.lat, lng: el.lon },
          rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1),
          open: 'Open 24/7'
        }));
        setLocations(formatted);
      }
    } catch (error) {
      console.error("Map Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- 2. Auto-Fetch Effect (The "Auto Show" Logic) ---
  useEffect(() => {
    if (mapBounds) {
      // Wait 1 second after user stops moving map to avoid spamming API
      const timeoutId = setTimeout(() => {
        fetchPlaces(mapBounds);
      }, 1000); 
      return () => clearTimeout(timeoutId);
    }
  }, [mapBounds, fetchPlaces]);

  // --- 3. Filter Logic ---
  const filteredData = locations.filter((item) => activeTab === 'All' || item.type === activeTab);
  const selectedItem = locations.find(item => item.id === selectedId) || null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header title="Live Map Directory" />

        <div className="flex-1 overflow-hidden p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            
            {/* LEFT: LIST */}
            <div className="lg:col-span-5 flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-white z-10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                      <h1 className="text-2xl font-bold text-slate-900">Nearby Locations</h1>
                      <div className="flex items-center gap-2 mt-1">
                        {isLoading ? (
                           <span className="text-blue-600 text-xs flex items-center gap-1 font-medium animate-pulse">
                             <RefreshCw size={12} className="animate-spin"/> Scanning area...
                           </span>
                        ) : (
                           <span className="text-emerald-600 text-xs flex items-center gap-1 font-medium">
                             <CheckCircle2 size={12}/> Live Data Active
                           </span>
                        )}
                      </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                  {['All', 'Hospital', 'Pharmacy'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* List Items */}
              <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
                {filteredData.length > 0 ? filteredData.map((item) => (
                  <div key={item.id} onClick={() => setSelectedId(item.id)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all ${selectedId === item.id ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.type === 'Hospital' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {item.type === 'Hospital' ? <Building2 size={24} /> : <Stethoscope size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate text-slate-800">{item.name}</h3>
                        <p className="text-sm text-slate-500 truncate mb-1">{item.address}</p>
                        <div className="flex items-center gap-3 text-xs">
                           <span className="font-medium text-slate-400">{item.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-center px-6">
                    <MapPin size={40} className="mb-2 opacity-20" />
                    <p className="text-sm">Scanning map area...</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: MAP */}
            <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-hidden">
              <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
                 <MapComponent 
                    center={selectedItem?.coordinates} 
                    markers={filteredData} 
                    selectedId={selectedId || 0} 
                    onSelect={setSelectedId}
                    onBoundsChange={setMapBounds} 
                 />
                 {selectedItem && (
                    <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 max-w-xs animate-in slide-in-from-left-4 fade-in duration-300">
                        <h2 className="font-bold text-slate-900">{selectedItem.name}</h2>
                        <p className="text-xs text-slate-500 mt-1 mb-3 line-clamp-2">{selectedItem.address}</p>
                        <div className="flex gap-2">
                           <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg flex justify-center gap-1 transition-colors"><Navigation size={12}/> Go</button>
                        </div>
                    </div>
                 )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}