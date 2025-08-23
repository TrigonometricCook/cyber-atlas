"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "",
    name: "" 
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setMessage("❌ Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (form.password.length < 6) {
      setMessage("❌ Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Create user account
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // 2️⃣ Create user document in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: form.name,
        email: form.email,
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      // 3️⃣ Get location (ask user permission)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // 4️⃣ Update Firestore document with location
          await setDoc(doc(db, "users", userCred.user.uid), {
            name: form.name,
            email: form.email,
            location: { latitude, longitude },
            createdAt: new Date(),
            lastLogin: new Date(),
          }, { merge: true });

          // 5️⃣ Redirect to Home page
          router.push("/Home");
        },
        async (error) => {
          console.warn("Location not available:", error);
          // Redirect without location
          router.push("/Home");
        }
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Sign Up
        </h1>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="mb-4 w-full rounded-lg border p-3 focus:border-blue-500 focus:ring focus:ring-blue-200"
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
          className="mb-4 w-full rounded-lg border p-3 focus:border-blue-500 focus:ring focus:ring-blue-200"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="mb-4 w-full rounded-lg border p-3 focus:border-blue-500 focus:ring focus:ring-blue-200"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className="mb-6 w-full rounded-lg border p-3 focus:border-blue-500 focus:ring focus:ring-blue-200"
        />

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <Link
            href="/Auth/signin"
            className="w-1/2 rounded-lg bg-gray-200 py-3 text-center font-semibold text-gray-700 hover:bg-gray-300 transition"
          >
            Sign In
          </Link>
        </div>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
