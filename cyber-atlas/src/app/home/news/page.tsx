"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Article = {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
};

type NewsResponse = {
  status: string;
  totalResults: number;
  articles: Article[];
};

export default function CybercrimeNewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const articlesPerPage = 10;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch articles from NewsAPI
  const fetchArticles = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cybercrime-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page,
          pageSize: articlesPerPage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data: NewsResponse = await response.json();
      
      setArticles(data.articles);
      setTotalResults(data.totalResults);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load cybercrime news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage]);

  const totalPages = Math.ceil(totalResults / articlesPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToReports = () => {
    router.push("/home"); // Adjust path as needed
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Loading cybercrime news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
            Cybercrime News
          </h1>
          <button
            onClick={handleBackToReports}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-gray-900 font-semibold shadow-lg transition-all"
          >
            Back to Home
          </button>
        </div>

        {/* Results info */}
        {!loading && (
          <div className="mb-6 text-gray-300">
            <p>
              Showing {((currentPage - 1) * articlesPerPage) + 1}-{Math.min(currentPage * articlesPerPage, totalResults)} of {totalResults} articles
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-900/50 backdrop-blur-sm border border-red-500/20 p-6 rounded-xl mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Articles feed */}
        <div className="space-y-6">
          {articles.map((article, index) => (
            <div
              key={`${article.url}-${index}`}
              className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Article image */}
                {article.urlToImage && (
                  <div className="lg:w-1/3 flex-shrink-0">
                    <Image
                      src={article.urlToImage}
                      alt={article.title}
                      width={400}
                      height={200}
                      className="w-full h-48 lg:h-32 object-cover rounded-lg border border-cyan-500/20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Article content */}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 text-cyan-300 hover:text-cyan-200 transition-colors">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {article.title}
                    </a>
                  </h2>

                  <div className="flex items-center text-gray-300 text-sm mb-3">
                    <span className="bg-gradient-to-r from-cyan-700 to-green-700 text-cyan-100 px-2 py-1 rounded text-xs">
                      {article.source.name}
                    </span>
                    {article.author && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{article.author}</span>
                      </>
                    )}
                    <span className="mx-2">•</span>
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>

                  {article.description && (
                    <p className="text-gray-100 mb-4 leading-relaxed">
                      {article.description}
                    </p>
                  )}

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                  >
                    Read full article
                    <svg 
                      className="w-4 h-4 ml-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-10 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-black/50 border border-cyan-500/20 text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500/10 transition-all"
            >
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-gray-900 border-cyan-400'
                        : 'bg-black/50 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-black/50 border border-cyan-500/20 text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500/10 transition-all"
            >
              Next
            </button>
          </div>
        )}

        {/* Page info */}
        {totalPages > 1 && (
          <div className="text-center mt-4 text-gray-400 text-sm">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>
    </div>
  );
}