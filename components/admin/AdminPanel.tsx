import React, { useState } from 'react';

const AdminPanel: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid credentials');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const apiKeys = [
        { name: 'OpenRouter API Key', key: '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', url: 'https://openrouter.ai/settings/keys' },
        { name: 'PoYo API Key', key: 'sk-gIv4XbAxnRo6197km3Lia3ZxVghXHMxgmPlnWWZJIm5Q0zJRy5ICcp0b6rDM79', url: 'https://poyo.ai/dashboard/api-key' },
        { name: 'Portkey API Key', key: 'ST4fIU5r6s6JvLGE/ad2F+8CCCrU', url: 'https://app.portkey.ai/api-keys' }
    ];

    return (
        <div className="container mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-green-800">Admin Dashboard - API Management</h1>
                <button 
                    onClick={() => setIsAuthenticated(false)}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                >
                    Logout
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manage URL</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {apiKeys.map((item, idx) => (
                            <tr key={idx}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    {item.key.substring(0, 10)}...{item.key.substring(item.key.length - 4)}
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(item.key)}
                                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                                    >
                                        Copy
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                <h3 className="font-bold">Security Note</h3>
                <p>These keys are for testing purposes. In a production environment, ensure all sensitive keys are stored securely using environment variables or secrets management.</p>
            </div>
        </div>
    );
};

export default AdminPanel;
