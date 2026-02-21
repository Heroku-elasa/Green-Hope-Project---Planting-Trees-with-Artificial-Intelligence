import React, { useState } from 'react';
import axios from 'axios';

interface TestResult {
  service: string;
  status: '✅' | '❌';
  latency?: number;
  error?: string;
  model?: string;
}

const ApiTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const newResults: TestResult[] = [];

    // PoYo AI Test
    try {
      const start = Date.now();
      await axios.post('https://api.poyo.ai/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      }, {
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_POYO_API_KEY || ''}` }
      });
      newResults.push({ service: 'PoYo AI', status: '✅', latency: Date.now() - start, model: 'gpt-4o-mini' });
    } catch (e: any) {
      newResults.push({ service: 'PoYo AI', status: '❌', error: e.response?.data?.error?.message || e.message });
    }

    // OpenRouter Test
    try {
      const start = Date.now();
      await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      }, {
        headers: { 
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ''}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Green Hope Project'
        }
      });
      newResults.push({ service: 'OpenRouter', status: '✅', latency: Date.now() - start, model: 'gemini-2.0-flash' });
    } catch (e: any) {
      newResults.push({ service: 'OpenRouter', status: '❌', error: e.response?.data?.error?.message || e.message });
    }

    // Portkey Test
    try {
      const start = Date.now();
      await axios.post('https://api.portkey.ai/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      }, {
        headers: {
          'x-portkey-api-key': import.meta.env.VITE_PORTKEY_API_KEY || '',
          'x-portkey-provider': 'openai',
          'Content-Type': 'application/json'
        }
      });
      newResults.push({ service: 'Portkey AI', status: '✅', latency: Date.now() - start, model: 'gpt-4o-mini' });
    } catch (e: any) {
      newResults.push({ service: 'Portkey AI', status: '❌', error: e.response?.data?.error?.message || e.message });
    }

    setResults(newResults);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-green-800">API Connectivity Test</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="mb-4 text-gray-600">Testing PoYo, OpenRouter, and Portkey integrations.</p>
        <button 
          onClick={runTests} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run All Tests'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((res, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{res.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-2xl">{res.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{res.latency ? `${res.latency}ms` : '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {res.error ? <span className="text-red-500">{res.error}</span> : `Model: ${res.model}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
        <p className="font-bold">Note on Environment Variables:</p>
        <p>Ensure <code>VITE_POYO_API_KEY</code>, <code>VITE_OPENROUTER_API_KEY</code>, and <code>VITE_PORTKEY_API_KEY</code> are set in your secrets. Vite requires the <code>VITE_</code> prefix for frontend access.</p>
      </div>
    </div>
  );
};

export default ApiTest;
