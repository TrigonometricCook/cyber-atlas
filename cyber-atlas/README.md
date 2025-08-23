# Cyber Atlas

A comprehensive platform for cybercrime awareness, threat detection, and community protection. Stay informed, stay safe, and help build a more secure digital world.

## Features

- **Threat Detection**: Advanced AI-powered analysis to identify and verify potential scams and cyber threats
- **Latest News**: Stay updated with the latest cybercrime news and security alerts from around the world
- **Community Reports**: Report and track cybercrime incidents in your area to help protect your community
- **Interactive Map**: Visualize cybercrime hotspots and incidents in your region
- **Phish Finder**: Detect and analyze potential phishing attempts

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, set up your environment variables by creating a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google API Key (for AI features)
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here

# News API Key
NEWS_API_KEY=your_news_api_key_here
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build for Production

```bash
npm run build
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Make sure to add all the required environment variables in your Vercel project settings.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Maps**: React Leaflet
- **Icons**: Lucide React
