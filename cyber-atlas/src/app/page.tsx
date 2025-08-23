"use client";

import Link from "next/link";

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-6 drop-shadow-lg">
            Cyber Atlas
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your comprehensive platform for cybercrime awareness, threat detection, and community protection. 
            Stay informed, stay safe, and help build a more secure digital world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/Auth/signup"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-gray-900 font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="/Auth/signin"
              className="px-8 py-4 bg-black/50 border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-semibold rounded-xl transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-xl text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Threat Detection</h3>
            <p className="text-gray-300">Advanced AI-powered analysis to identify and verify potential scams and cyber threats.</p>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-xl text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Latest News</h3>
            <p className="text-gray-300">Stay updated with the latest cybercrime news and security alerts from around the world.</p>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-xl text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Community Reports</h3>
            <p className="text-gray-300">Report and track cybercrime incidents in your area to help protect your community.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-cyan-300 mb-4">Ready to protect yourself?</h2>
          <p className="text-gray-300 mb-8">Join thousands of users who are already staying safe with Cyber Atlas.</p>
          <Link
            href="/Auth/signup"
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-gray-900 font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
}
