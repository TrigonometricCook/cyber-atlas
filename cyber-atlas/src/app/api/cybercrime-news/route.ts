// app/api/cybercrime-news/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = "b824e0993828af0b8ffc1eb8961b035f";
const NEWS_API_URL = "https://gnews.io/api/v4/search";

export async function POST(request: NextRequest) {
  try {
    const { page = 1, pageSize = 10 } = await request.json();

    // Calculate the date from 30 days ago for fresher news
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const fromDateString = fromDate.toISOString();

    const searchParams = new URLSearchParams({
      q: 'cybercrime OR "cyber" OR "cyber attack" OR "data breach" OR "ransomware" OR "phishing" OR "malware" OR "hacking"',
      from: fromDateString,
      sortBy: 'popularity',
      language: 'en',
      page: page.toString(),
      max: pageSize.toString(),
      apikey: API_KEY,
    });

    const response = await fetch(`${NEWS_API_URL}?${searchParams}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'CybercrimeNewsApp/1.0',
      },
    });

    if (!response.ok) {
      console.error('NewsAPI Error:', response.status, response.statusText);
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch news data.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Filter out articles with incomplete data
    const filteredArticles = data.articles.filter((article: unknown) => {
      const articleObj = article as { title?: string; description?: string; url?: string };
      return articleObj.title && 
        articleObj.title !== '[Removed]' && 
        articleObj.description && 
        articleObj.description !== '[Removed]' &&
        articleObj.url;
    });

    return NextResponse.json({
      status: data.status,
      totalResults: data.totalResults,
      articles: filteredArticles,
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
