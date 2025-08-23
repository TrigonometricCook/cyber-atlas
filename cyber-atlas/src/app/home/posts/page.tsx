"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase"; // <- make sure you created firebase.ts config
import { collection, getDocs } from "firebase/firestore";

type Report = {
  id: string;
  title: string;
  description: string;
  scamType: string;
  createdAt: any;
  reporterName?: string;
  reporterEmail?: string;
  date?: string;
  time?: string;
  tags?: string[];
  evidence?: string; // NEW field
  location?: {
    latitude: number;
    longitude: number;
  };
  locationName?: string; // city, state, country after reverse geocode
};

export default function FraudReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Reverse geocode helper
  const fetchLocationName = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      return data?.address
        ? `${data.address.city || data.address.town || data.address.village || "Unknown"}, ${data.address.state || ""}, ${data.address.country || ""}`
        : "Unknown Location";
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      return "Unknown Location";
    }
  };

  // Fetch Firestore reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "scamReports"));
        const fetchedReports: Report[] = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          let locationName = undefined;

          if (data.location?.latitude && data.location?.longitude) {
            locationName = await fetchLocationName(
              data.location.latitude,
              data.location.longitude
            );
          }

          fetchedReports.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            scamType: data.scamType,
            createdAt: data.createdAt,
            reporterName: data.reporterName,
            reporterEmail: data.reporterEmail,
            date: data.date,
            time: data.time,
            tags: data.tags || [],
            evidence: data.evidence || "", // add evidence
            location: data.location,
            locationName,
          });
        }

        setReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleReportScam = () => {
    router.push("/home/report");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 text-white">
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
            Fraud & Scam Reports
          </h1>
          <button
            onClick={handleReportScam}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-gray-900 font-semibold shadow-lg transition-all"
          >
            Report a Scam
          </button>
        </div>

        {/* Reports feed */}
        <div className="space-y-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all"
            >
              <h2 className="text-2xl font-semibold mb-2 text-cyan-300">
                {report.title}
              </h2>
              <div className="flex items-center text-gray-300 text-sm mb-2">
                <span>{report.reporterName || "Anonymous"}</span>
                <span className="mx-2">•</span>
                <span>
                  {report.date} {report.time}
                </span>
              </div>
              {report.locationName && (
                <p className="text-sm text-green-300 mb-2">
                  📍 {report.locationName}
                </p>
              )}
              <p className="text-gray-100 mb-4 leading-relaxed">
                {report.description}
              </p>

              {/* Scam Evidence */}
              {report.evidence && (
                <div className="mt-3 p-3 rounded-lg bg-gray-900/60 border border-cyan-500/20">
                  <h3 className="text-sm font-semibold text-cyan-300 mb-1">
                    Scam Attachment
                  </h3>
                  <p className="text-gray-200 text-sm whitespace-pre-line">
                    {report.evidence}
                  </p>
                </div>
              )}

              {report.tags && report.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {report.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gradient-to-r from-cyan-700 to-green-700 text-cyan-100 px-3 py-1 rounded-full text-sm shadow-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
