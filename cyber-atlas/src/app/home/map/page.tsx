"use client";

import { GoogleMap, Marker, InfoWindow, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import { useState } from "react";

// Map container style
const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "12px",
};

// Map center (India)
const center = { lat: 20.5937, lng: 78.9629 };

// Scam types
const scamTypesList = [
  "Fake E-commerce Scam",
  "Fake Job Offer Scam",
  "SIM Card Replacement Scam",
  "WhatsApp Account Hacking Scam",
  "Cryptocurrency Investment Scam",
  "UPI Scam",
  "WhatsApp Lottery/Prize Scam",
  "Phishing Scam (Link Sharing)",
  "Fake Technical Support Scam",
  "Fake Charity/Donation Scam",
  "Fake Loan Approval Scam",
  "Fake Discount/Refund Scam",
  "Tax Refund Scam",
  "Friend in Distress Scam",
];

// Marker colors by scam type
const markerColors: Record<string, string> = {
  "Fake E-commerce Scam": "#FF4C4C",
  "Fake Job Offer Scam": "#FF9900",
  "SIM Card Replacement Scam": "#FFD700",
  "WhatsApp Account Hacking Scam": "#800080",
  "Cryptocurrency Investment Scam": "#00CC44",
  UPI: "#3399FF",
  "WhatsApp Lottery/Prize Scam": "#FF66CC",
  "Phishing Scam (Link Sharing)": "#00FFFF",
  "Fake Technical Support Scam": "#99FF33",
  "Fake Charity/Donation Scam": "#FF00FF",
  "Fake Loan Approval Scam": "#00CCCC",
  "Fake Discount/Refund Scam": "#8A2BE2",
  "Tax Refund Scam": "#A52A2A",
  "Friend in Distress Scam": "#808080",
};

// Recency filters
const recencyFilters = ["Last 24h", "Last 7 days", "Last 30 days", "All time"];

// Indian cities
const indianCities = [
  { name: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { name: "Patna", lat: 25.5941, lng: 85.1376 },
  { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
];

// Generate mock reports
const generateMockReports = (count = 300) => {
  const reports = [];
  for (let i = 0; i < count; i++) {
    const scamType = scamTypesList[Math.floor(Math.random() * scamTypesList.length)];
    const city = indianCities[Math.floor(Math.random() * indianCities.length)];
    const jitter = () => (Math.random() - 0.5) * 0.1;

    reports.push({
      id: i,
      title: `${scamType} #${i + 1}`,
      description: `Description for ${scamType} #${i + 1}`,
      type: scamType,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      location: { lat: city.lat + jitter(), lng: city.lng + jitter() },
      city: city.name,
    });
  }
  return reports;
};

const mockReports = generateMockReports();

export default function FraudMapPage() {
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [selectedScams, setSelectedScams] = useState<string[]>([]);
  const [recency, setRecency] = useState("All time");

  const toggleScam = (scam: string) => {
    setSelectedScams((prev) =>
      prev.includes(scam) ? prev.filter((s) => s !== scam) : [...prev, scam]
    );
  };

  const filteredReports = mockReports.filter((report) => {
    const matchesType = selectedScams.length === 0 || selectedScams.includes(report.type);

    const now = Date.now();
    const reportTime = new Date(report.date).getTime();
    let matchesRecency = true;
    if (recency === "Last 24h") matchesRecency = reportTime > now - 24 * 60 * 60 * 1000;
    if (recency === "Last 7 days") matchesRecency = reportTime > now - 7 * 24 * 60 * 60 * 1000;
    if (recency === "Last 30 days") matchesRecency = reportTime > now - 30 * 24 * 60 * 60 * 1000;

    return matchesType && matchesRecency;
  });

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
  });

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading Google Maps...</div>;

  // Cluster style
  const clusterStyles = [
    {
      textColor: "white",
      url: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m1.png",
      height: 50,
      width: 50,
      textSize: 14,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
          Scam Reports Map
        </h1>

        {/* Filters */}
        <div className="bg-white/10 p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          {/* Scam type checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-h-64 overflow-y-auto pr-2">
            {scamTypesList.map((scam) => (
              <label
                key={scam}
                className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/15 transition"
              >
                <input
                  type="checkbox"
                  checked={selectedScams.includes(scam)}
                  onChange={() => toggleScam(scam)}
                  className="accent-cyan-400"
                />
                <span className="flex-1">{scam}</span>
              </label>
            ))}
          </div>

          {/* Recency filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-300">Show reports from:</span>
            {recencyFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setRecency(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition shadow-md ${
                  recency === filter
                    ? "bg-gradient-to-r from-cyan-500 to-green-500 text-gray-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="shadow-lg border border-cyan-500/20 overflow-hidden rounded-2xl">
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={5}>
            <MarkerClusterer
              averageCenter
              enableRetinaIcons
              gridSize={60}
              styles={clusterStyles}
              onClick={(cluster) => {
                const map = cluster.getMap();
                if (map && "fitBounds" in map) {
                  map.fitBounds(cluster.getBounds());
                }
              }}
            >
              {(clusterer) => (
                <>
                  {filteredReports.map((report) => (
                    <Marker
                      key={report.id}
                      position={report.location}
                      clusterer={clusterer}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: markerColors[report.type] || "#fff",
                        fillOpacity: 1,
                        strokeColor: "#000",
                        strokeWeight: 2,
                        scale: 14,
                      }}
                      onClick={() => setActiveMarker(report.id)}
                    >
                      {activeMarker === report.id && (
                        <InfoWindow
                          position={report.location}
                          onCloseClick={() => setActiveMarker(null)}
                        >
                          <div className="text-black max-w-xs">
                            <h3 className="font-bold">{report.title}</h3>
                            <p>{report.description}</p>
                            <p className="text-sm text-gray-600">{report.type}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(report.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">{report.city}</p>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  ))}
                </>
              )}
            </MarkerClusterer>
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}
