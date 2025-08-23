'use client';
import React, { useState } from 'react';
import { AlertTriangle, Send, Image, Mic, Shield, X, CheckCircle, Scan, Bot } from 'lucide-react';

interface ThreatResult {
  scam_type: string;
  score: number;
  prob: number;
  why: string[][];
  slots: Record<string, string>;
  final_risk: number;
  risk_label: string;
}

interface ApiResponse {
  version: string;
  count: number;
  sri: number;
  results: ThreatResult[];
}

const VerifyThreatPage: React.FC = () => {
  const [messages, setMessages] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string>('');

  const addMessage = () => {
    setMessages([...messages, '']);
  };

  const updateMessage = (index: number, value: string) => {
    const newMessages = [...messages];
    newMessages[index] = value;
    setMessages(newMessages);
  };

  const removeMessage = (index: number) => {
    if (messages.length > 1) {
      const newMessages = messages.filter((_, i) => i !== index);
      setMessages(newMessages);
    }
  };

  const generateSummary = async () => {
    if (!results) return;

    setIsGeneratingSummary(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': '' + process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Please analyze the following threat detection results and provide a comprehensive summary in plain English that a regular user can understand:

Analysis Results:
- Total messages analyzed: ${results.count}
- Version: ${results.version}
- SRI: ${results.sri}

Detailed Results:
${results.results.map((result, index) => `
Result ${index + 1}:
- Scam Type: ${result.scam_type}
- Detection Score: ${result.score}
- Probability: ${(result.prob * 100).toFixed(1)}%
- Detection Reasons: ${result.why.map(reason => Array.isArray(reason) ? reason.join(', ') : reason).join('; ')}
- Additional Details: ${Object.entries(result.slots).map(([key, value]) => `${key}: ${value}`).join(', ')}
`).join('\n')}

Please provide:
1. An overall assessment of the threat level
2. Key findings and concerns
3. Recommended actions for the user
4. Any patterns or indicators detected

Keep the summary concise but informative, avoiding technical jargon where possible.`
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Remove all occurrences of '**' from the generated summary
      const generatedSummary = data.candidates?.[0]?.content?.parts?.[0]?.text.replace(/\*\*/g, "") || 'Unable to generate summary';
      setSummary(generatedSummary);
    } catch (err) {
      console.error('Error generating summary:', err);
      setSummary('Error generating summary. Please try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSubmit = async () => {
    const nonEmptyMessages = messages.filter(msg => msg.trim() !== '');
    
    if (nonEmptyMessages.length === 0) {
      setError('Please enter at least one message');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);
    setSummary('');

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/verify-threat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: nonEmptyMessages,
          ml_probs: nonEmptyMessages.map(() => 0) // Placeholder values
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the messages');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (riskLabel: string) => {
    switch (riskLabel.toLowerCase()) {
      case 'high':
        return 'text-red-400 bg-red-900/60 border-red-500/30';
      case 'medium':
        return 'text-orange-400 bg-orange-900/60 border-orange-500/30';
      case 'low':
        return 'text-green-400 bg-green-900/60 border-green-500/30';
      default:
        return 'text-cyan-400 bg-cyan-900/60 border-cyan-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-cyan-400 mr-3 drop-shadow-lg" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
              Threat Verifier
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Analyze messages for potential scams and threats using advanced AI detection
          </p>
        </div>

        {/* Main Input Section */}
        <div className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all mb-6">
          <h2 className="text-2xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
            <Scan className="w-6 h-6" />
            Enter Messages to Analyze
          </h2>
          
          {/* Text Input Section */}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="relative">
                <textarea
                  value={message}
                  onChange={(e) => updateMessage(index, e.target.value)}
                  placeholder={`Message ${index + 1} - Enter suspicious text here...`}
                  className="w-full p-4 bg-gray-900/60 border border-cyan-500/30 rounded-lg resize-vertical min-h-24 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none text-gray-100 placeholder-gray-400"
                  rows={3}
                />
                {messages.length > 1 && (
                  <button
                    onClick={() => removeMessage(index)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              onClick={addMessage}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-2 transition-colors"
            >
              + Add another message
            </button>
          </div>

          {/* Future Input Options */}
          <div className="mt-6 pt-6 border-t border-cyan-500/20">
            <p className="text-sm text-gray-400 mb-3">Additional input methods (coming soon):</p>
            <div className="flex gap-3">
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-500 rounded-lg cursor-not-allowed border border-gray-600/30"
              >
                <Image className="w-5 h-5" />
                Upload Image
              </button>
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-500 rounded-lg cursor-not-allowed border border-gray-600/30"
              >
                <Mic className="w-5 h-5" />
                Record Voice
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-700 text-gray-900 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
                  Analyzing Threats...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Verify Threats
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/60 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* AI Summary Section */}
            <div className="bg-black/50 backdrop-blur-sm border border-purple-500/20 p-6 rounded-xl shadow-lg hover:shadow-purple-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-purple-300 flex items-center gap-2">
                  <Bot className="w-6 h-6" />
                  AI Summary
                </h2>
                <button
                  onClick={generateSummary}
                  disabled={isGeneratingSummary}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
                >
                  {isGeneratingSummary ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      Generate Summary
                    </>
                  )}
                </button>
              </div>
              
              {summary ? (
                <div className="bg-gray-900/60 border border-purple-500/20 rounded-lg p-4">
                  <div className="text-gray-200 whitespace-pre-wrap">{summary}</div>
                </div>
              ) : (
                <div className="bg-gray-900/60 border border-purple-500/20 rounded-lg p-4 text-gray-400 text-center">
                  Click &quot;Generate Summary&quot; to get an AI-powered analysis of the results
                </div>
              )}
            </div>

            {/* Detailed Results Section */}
            <div className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all">
              <h2 className="text-2xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Detailed Analysis Results
              </h2>
              
              <div className="mb-4 text-sm text-gray-400 bg-gray-900/60 p-3 rounded-lg border border-cyan-500/20">
                <p>Version: <span className="text-cyan-300">{results.version}</span> | Analyzed: <span className="text-cyan-300">{results.count}</span> messages | SRI: <span className="text-cyan-300">{results.sri}</span></p>
              </div>

              <div className="space-y-4">
                {results.results.map((result, index) => (
                  <div key={index} className="bg-gray-900/60 border border-cyan-500/20 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-cyan-300">
                        Scam Type: {result.scam_type}
                      </h3>
                      <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getRiskColor(result.risk_label)}`}>
                        {result.risk_label.toUpperCase()} RISK
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/10">
                        <p className="text-sm text-gray-400">Score</p>
                        <p className="text-lg font-semibold text-cyan-300">{result.score}</p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/10">
                        <p className="text-sm text-gray-400">Probability</p>
                        <p className="text-lg font-semibold text-cyan-300">{(result.prob * 100).toFixed(1)}%</p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/10 flex items-center gap-2">
                        {result.final_risk < 0.3 ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <p className="text-sm font-medium text-cyan-300">
                            {result.final_risk < 0.3 ? 'Likely Safe' : 'Potential Threat'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {result.why && result.why.length > 0 && (
                      <div className="mb-4 bg-black/40 p-4 rounded-lg border border-cyan-500/10">
                        <p className="text-sm font-medium text-cyan-300 mb-2">Detection Reasons:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                          {result.why.map((reason, reasonIndex) => (
                            <li key={reasonIndex}>{Array.isArray(reason) ? reason.join(', ') : reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Object.keys(result.slots).length > 0 && (
                      <div className="bg-black/40 p-4 rounded-lg border border-cyan-500/10">
                        <p className="text-sm font-medium text-cyan-300 mb-2">Additional Details:</p>
                        <div className="space-y-2">
                          {Object.entries(result.slots).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-1 border-b border-gray-700/50 last:border-b-0">
                              <span className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="text-sm font-medium text-cyan-300">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* Report Button */}
<div className="mt-10 flex justify-center">
  <a
    href="https://cybercrime.gov.in/Webform/Crime_ReportAnonymously.aspx"
    target="_blank"
    rel="noopener noreferrer"
    className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-gray-900 font-semibold shadow-lg flex items-center gap-2 transition-all"
  >
    <AlertTriangle className="w-5 h-5" />
    Report Anonymously to Cyber Crime
  </a>
</div>

      </div>
    </div>
  );
};

export default VerifyThreatPage;