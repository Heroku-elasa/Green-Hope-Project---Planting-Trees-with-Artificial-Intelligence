import React, { useState } from 'react';

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

  const addLog = (log: AILog) => setLogs(prev => [log, ...prev].slice(0, 50));

  const testProvider = async (provider: AIProvider) => {
    const id = provider.id;
    setProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'testing' } : p));
    
    try {
      let url = provider.endpoint;
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let body: any = {
        messages: [{ role: 'user', content: testPrompt }],
        max_tokens: 60
      };

      if (id === 'openrouter') {
        headers['Authorization'] = `Bearer ${API_KEYS.openrouter}`;
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'Green Hope Project';
      } else if (id === 'portkey') {
        headers['x-portkey-api-key'] = API_KEYS.portkey;
        headers['x-portkey-provider'] = 'openai';
      }

      const start = Date.now();
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      const data = await res.json();
      const duration = Date.now() - start;

      if (res.ok && data.choices?.[0]?.message?.content) {
        const response = data.choices[0].message.content;
        setProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'success', lastLatency: duration } : p));
        addLog({ id: Date.now(), timestamp: new Date().toISOString(), provider: id, model: provider.model, status: 'success', duration, response });
      } else {
        throw new Error(data.error?.message || res.statusText);
      }
    } catch (err: any) {
      setProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'error', lastError: err.message } : p));
      addLog({ id: Date.now(), timestamp: new Date().toISOString(), provider: id, model: provider.model, status: 'error', duration: 0, error: err.message });
    }
  };

  return (
    <div className="p-6 rtl bg-gray-900 text-white border-b border-gray-700">
      <h1 className="text-2xl font-bold mb-4">🧪 تست APIهای هوش مصنوعی</h1>
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          value={testPrompt}
          onChange={e => setTestPrompt(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-2 rounded flex-1"
        />
        <button
          onClick={() => providers.forEach(testProvider)}
          className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
        >
          تست همه
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map(p => (
          <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h2 className="font-bold">{p.name}</h2>
            <p className="text-sm text-gray-400">مدل: {p.model}</p>
            <div className="mt-2">
              وضعیت: {p.status === 'success' ? '✅ موفق' : p.status === 'error' ? '❌ خطا' : '⚪ در انتظار'}
            </div>
            {p.lastError && <p className="text-red-400 text-xs mt-1">{p.lastError}</p>}
            <button
              onClick={() => testProvider(p)}
              className="mt-3 bg-gray-700 px-4 py-1 rounded text-sm hover:bg-gray-600"
            >
              تست مجدد
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTest;
