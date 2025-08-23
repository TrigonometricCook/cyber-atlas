"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

// List of scam types
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

export default function SubmitScamPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scamType, setScamType] = useState(scamTypesList[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [tags, setTags] = useState("");
  const [evidence, setEvidence] = useState("");

  // Auth & user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Fetch user's document from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const data = userSnapshot.data();

          // Set location if exists
          if (data.location) {
            setUserLocation({
              latitude: data.location.latitude,
              longitude: data.location.longitude,
            });
          }

          // Set user type if exists
          if (data.type) {
            setUserType(data.type);
          }
        }
      } else {
        setCurrentUser(null);
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to submit a report.");
      return;
    }

    try {
      await addDoc(collection(db, "scamReports"), {
        title,
        description,
        scamType,
        date: date || null,
        time: time || null,
        reporterName: currentUser.displayName || currentUser.email,
        reporterEmail: currentUser.email,
        tags: tags.split(",").map((t) => t.trim()),
        evidence: evidence || null,
        location: userLocation || null,
        userType: userType || "unknown",
        createdAt: serverTimestamp(),
      });

      alert("Scam report submitted!");
      router.push("/home/posts");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report.");
    }
  };

  if (loadingUser) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!currentUser) {
    return <p className="text-center mt-10">Please log in to submit a report.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-green-900 text-white flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold mb-8 text-teal-300 text-center">
          Submit a Scam Report
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-2 font-semibold">Scam Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-black/60 border border-gray-700 focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-semibold">Description / Details</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-black/60 border border-gray-700 focus:outline-none focus:border-teal-400"
              rows={4}
            />
          </div>

          {/* Scam Evidence */}
          <div>
            <label className="block mb-2 font-semibold">Scam Evidence (Paste the message/email)</label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Paste the scam message, email, or SMS here..."
              className="w-full p-3 rounded-lg bg-black/60 border border-gray-700 focus:outline-none focus:border-teal-400"
              rows={5}
            />
          </div>

          {/* Scam Type */}
          <div>
            <label className="block mb-2 font-semibold">Type of Scam</label>
            <select
              value={scamType}
              onChange={(e) => setScamType(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/60 border border-gray-700 focus:outline-none focus:border-teal-400"
            >
              {scamTypesList.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 font-semibold">Date of Incident (optional)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-lg bg-black/60 border border-gray-700 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex-1">
              <label className="block mb-2 font-semibold">Time of Incident (optional)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 rounded-lg bg-black/60 border border-gray-700 focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block mb-2 font-semibold">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/60 border border-gray-700 focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-gray-900 font-semibold rounded-xl shadow-lg transition-all"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}
