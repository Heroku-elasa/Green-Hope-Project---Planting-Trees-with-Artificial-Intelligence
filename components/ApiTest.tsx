import React, { useState, useEffect } from 'react';

interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  model: string;
  models: string[];
  endpoint: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  lastError?: string;
  lastLatency?: number;
}

interface AILog {
  id: number;
  timestamp: string;
  provider: string;
  model: string;
  status: 'success' | 'error';
  duration: number;
  error?: string;
  response?: string;
}

const DEFAULT_PROVIDERS: AIProvider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter (Free Tier)',
    enabled: true,
    model: 'deepseek/deepseek-r1-0528:free',
    models: [
      'deepseek/deepseek-r1-0528:free',
      'upstage/solar-pro-3:free',
      'arcee-ai/trinity-large-preview:free',
      'stepfun/step-3.5-flash:free',
      'z-ai/glm-4.5-air:free'
    ],
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    status: 'idle'
  },
  {
    id: 'portkey',
    name: 'Portkey (Gateway)',
    enabled: true,
    model: 'gpt-3.5-turbo',
    models: ['gpt-3.5-turbo', 'gpt-4o-mini', 'claude-3-haiku'],
    endpoint: 'https://api.portkey.ai/v1/chat/completions',
    status: 'idle'
  }
];

const API_KEYS = {
  openrouter: "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",
  portkey: "ST4fIU5r6s6JvLGE/ad2F+8CCCrU",
  poyo: "sk-gIv4XbAxnRo6197km3Lia3ZxVghXHMxgmPlnWWZJIm5Q0zJRy5ICcp0b6rDM79"
};

const ApiTest: React.FC = () => {
  const [providers, setProviders] = useState<AIProvider[]>(DEFAULT_PROVIDERS);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [testPrompt, setTestPrompt] = useState('یک جمله کوتاه بگو.');
  const [savedResults, setSavedResults] = useState<any[]>([]);

  useEffect(() => {
    fetchSavedResults();
  }, []);

  const fetchSavedResults = async () => {
    try {
      const response = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'SELECT * FROM api_test_results ORDER BY status DESC, latency ASC, tested_at DESC LIMIT 50' })
      });
      const data = await response.json();
      if (data.rows) setSavedResults(data.rows);
    } catch (err) {
      console.error('Failed to fetch saved results:', err);
    }
  };

  const saveResult = async (provider: string, model: string, status: string, latency: number) => {
    try {
      await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'INSERT INTO api_test_results (api_name, model, status, latency, response) VALUES ($1, $2, $3, $4, $5)',
          params: [provider, model, status === 'success' ? 'WORKS' : 'FAILED', latency, 'Tested via Frontend UI']
        })
      });
      fetchSavedResults();
    } catch (err) {
      console.error('Failed to save result:', err);
    }
  };

  const addLog = (log: AILog) => setLogs(prev => [log, ...prev].slice(0, 50));

  const testModel = async (provider: AIProvider, model: string) => {
    try {
      let url = provider.endpoint;
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let body: any = {
        model: model,
        messages: [{ role: 'user', content: testPrompt }],
        max_tokens: 60
      };

      let key = provider.id === 'openrouter' ? API_KEYS.openrouter : 
                provider.id === 'portkey' ? API_KEYS.portkey : API_KEYS.poyo;

      if (provider.id === 'openrouter') {
        headers['Authorization'] = `Bearer ${key}`;
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'Green Hope Project';
      } else if (provider.id === 'portkey') {
        headers['x-portkey-api-key'] = key;
        headers['x-portkey-provider'] = 'openai';
      }

      const start = Date.now();
      let res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      
      // Fallback to OpenRouter if Portkey fails
      if (!res.ok && provider.id === 'portkey' && API_KEYS.openrouter) {
        console.log('Portkey failed, falling back to OpenRouter...');
        url = 'https://openrouter.ai/api/v1/chat/completions';
        headers = { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEYS.openrouter}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Green Hope Project (Fallback)'
        };
        body.model = 'deepseek/deepseek-r1-0528:free'; // Use a reliable free fallback
        res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      }

      const data = await res.json();
      const duration = Date.now() - start;

      if (res.ok && (data.choices?.[0]?.message?.content || data.choices?.[0]?.text)) {
        const response = data.choices[0].message?.content || data.choices[0].text;
        saveResult(provider.id, model, 'success', duration);
        addLog({ id: Date.now(), timestamp: new Date().toISOString(), provider: provider.id, model, status: 'success', duration, response });
        return { success: true, duration };
      } else {
        throw new Error(data.error?.message || res.statusText);
      }
    } catch (err: any) {
      saveResult(provider.id, model, 'error', 0);
      addLog({ id: Date.now(), timestamp: new Date().toISOString(), provider: provider.id, model, status: 'error', duration: 0, error: err.message });
      return { success: false, error: err.message };
    }
  };

  const testAll = async () => {
    for (const provider of providers) {
      // Test at least half of the models
      const modelsToTest = provider.models.slice(0, Math.ceil(provider.models.length / 2));
      for (const model of modelsToTest) {
        await testModel(provider, model);
        await new Promise(r => setTimeout(r, 500));
      }
    }
  };

  return (
    <div className="p-6 rtl bg-gray-900 text-white border-b border-gray-700">
      <h1 className="text-2xl font-bold mb-4">🧪 تست عمیق APIهای هوش مصنوعی</h1>
      
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          value={testPrompt}
          onChange={e => setTestPrompt(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-2 rounded flex-1"
        />
        <button
          onClick={testAll}
          className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 font-bold"
        >
          تست همه‌جانبه (Deep Test)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4 text-blue-400">نتایج ذخیره شده در دیتابیس</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-2">سرویس</th>
                  <th className="p-2">مدل</th>
                  <th className="p-2">وضعیت</th>
                  <th className="p-2">تاخیر (ms)</th>
                </tr>
              </thead>
              <tbody>
                {savedResults.map((r, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="p-2">{r.api_name}</td>
                    <td className="p-2">{r.model}</td>
                    <td className="p-2">
                      <span className={r.status === 'WORKS' ? 'text-green-400' : 'text-red-400'}>
                        {r.status === 'WORKS' ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="p-2">{r.latency || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-green-400">لاگ‌های تست زنده</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {logs.map(log => (
              <div key={log.id} className={`p-2 rounded border-l-4 ${log.status === 'success' ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{log.provider} - {log.model}</span>
                  <span>{log.duration}ms</span>
                </div>
                <div className="text-sm mt-1">
                  {log.status === 'success' ? log.response?.substring(0, 100) + '...' : log.error}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
