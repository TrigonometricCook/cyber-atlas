"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export default function SigninPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, form.email, form.password);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          await updateDoc(doc(db, "users", userCred.user.uid), {
            location: { latitude, longitude },
            lastLogin: new Date(),
          });

          router.push("/Home");
        },
        async (error) => {
          console.warn("Location not available:", error);

          await updateDoc(doc(db, "users", userCred.user.uid), {
            lastLogin: new Date(),
          });

          router.push("/Home");
        }
      );
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-teal-900 to-green-900">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-cyan-500/20">
        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-6">
          Sign In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-gray-900 font-semibold shadow-lg transition-all"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-300">
          Don't have an account?{" "}
          <a
            href="/Auth/signup"
            className="text-cyan-400 font-semibold hover:underline"
          >
            Sign Up
          </a>
        </p>

        {message && (
          <p className="mt-4 text-center text-red-400 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
