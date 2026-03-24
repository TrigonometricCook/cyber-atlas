// app/api/cybercrime-news/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = "33b2ce4be9754a17a9279913f9663591";
// Use a proxy to hide Vercel's identity if the direct call fails
const NEWS_API_URL = "https://newsapi.org/v2/everything";

export async function POST(request: NextRequest) {
  try {
    const { page = 1, pageSize = 10 } = await request.json();

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const fromDateString = fromDate.toISOString().split('T')[0];

    const query = 'cybercrime OR "cyber attack" OR "data breach" OR "ransomware"';
    
    const url = `${NEWS_API_URL}?q=${encodeURIComponent(query)}&from=${fromDateString}&sortBy=publishedAt&language=en&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // More aggressive headers to mimic a real desktop browser
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://newsapi.org/'
      },
      next: { revalidate: 3600 } // Cache for 1 hour to avoid rate limits
    });

    // If NewsAPI blocks Vercel (Status 426), we tell the user exactly what's up
    if (response.status === 426) {
      return NextResponse.json(
        { error: 'NewsAPI blocks free cloud deployments. Use a local environment or a different API.' },
        { status: 426 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || 'Failed' }, { status: response.status });
    }

    const data = await response.json();
    
    const filteredArticles = data.articles.filter((article: any) => 
      article.title && article.title !== '[Removed]' && article.url
    );

    return NextResponse.json({
      status: data.status,
      totalResults: data.totalResults,
      articles: filteredArticles,
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
