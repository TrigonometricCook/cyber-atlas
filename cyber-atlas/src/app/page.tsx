"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    type: "student",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const userTypes = [
    "Student",
    "Homemaker",
    "Senior Citizen",
    "Employee",
    "Freelancer",
    "Other",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeSelect = (type: string) => {
    setForm({ ...form, type: type.toLowerCase() });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      if (form.name) {
        await updateProfile(userCred.user, { displayName: form.name });
      }

      // Function to get location as a Promise
      const getLocation = () =>
        new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
          if (!navigator.geolocation) {
            resolve(null);
          } else {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                resolve({ latitude, longitude });
              },
              (error) => {
                console.warn("Location not available:", error);
                resolve(null);
              },
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }
        });

      const location = await getLocation();

      await setDoc(doc(db, "users", userCred.user.uid), {
        name: form.name,
        email: form.email,
        type: form.type,
        location,
        createdAt: new Date(),
      });

      router.push("/home");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-teal-900 to-green-900">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-cyan-500/20">
        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-6">
          Create an Account
        </h1>

        {/* Step 1: Name, Email, Password */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-black/60 border border-cyan-500/30 placeholder-gray-400 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-black/60 border border-cyan-500/30 placeholder-gray-400 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-black/60 border border-cyan-500/30 placeholder-gray-400 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-gray-900 font-semibold shadow-lg transition-all"
            >
              Next
            </button>
          </form>
        )}

        {/* Step 2: User Type Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-300 mb-2 font-medium text-center">Select User Type:</p>
            <div className="grid grid-cols-2 gap-2">
              {userTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`py-3 px-4 rounded-xl font-semibold shadow transition text-center
                    ${
                      form.type === type.toLowerCase()
                        ? "bg-gradient-to-r from-cyan-500 to-green-500 border border-cyan-400 text-gray-900"
                        : "bg-gray-800/80 border border-cyan-500/30 text-white hover:bg-gradient-to-r hover:from-cyan-400 hover:to-green-400"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-gray-900 font-semibold shadow-lg transition-all mt-4"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-gray-300">
          Already have an account?{" "}
          <a
            href="/auth/signin"
            className="text-cyan-400 font-semibold hover:underline"
          >
            Sign In
          </a>
        </p>

        {message && (
          <p className="mt-4 text-center text-red-400 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
