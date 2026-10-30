import { useEffect, useState } from 'react';
import axios from 'axios';

const Settings = () => {
  const [config, setConfig] = useState({ provider: 'mock', hasApiKey: false, baseUrl: '', model: '', apiKeyMasked: '' });
  const [file, setFile] = useState(null);
  const [manual, setManual] = useState({ apiKey: '', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' });
  const [status, setStatus] = useState('');
  const [testing, setTesting] = useState(false);

  const load = () => {
    axios.get('http://localhost:5002/api/config').then(res => setConfig(res.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const uploadEnv = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('envFile', file);
    try {
      await axios.post('http://localhost:5002/api/config/env', formData);
      setStatus('Configuration saved from .env');
      load();
    } catch (e) {
      setStatus('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  const saveManual = async () => {
    try {
      await axios.post('http://localhost:5002/api/config/manual', manual);
      setStatus('Configuration saved');
      load();
    } catch (e) {
      setStatus('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  const switchProvider = async (provider) => {
    try {
      await axios.post('http://localhost:5002/api/config/provider', { provider });
      setStatus('Provider updated');
      load();
    } catch (e) {
      setStatus('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  const testConn = async () => {
    setTesting(true);
    setStatus('');
    try {
      const res = await axios.post('http://localhost:5002/api/config/test');
      setStatus(res.data.message || 'Test completed');
    } catch (e) {
      setStatus('Error: ' + (e.response?.data?.message || e.message));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Integration</h1>
        <p className="text-gray-600 mt-1">Manage AI providers and API connections</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">Provider:</span> {config.provider === 'deepseek' ? 'DeepSeek' : 'Mock'}</div>
          <div><span className="font-medium">API Key:</span> {config.hasApiKey ? config.apiKeyMasked : 'Not configured'}</div>
          <div><span className="font-medium">Base URL:</span> {config.baseUrl || '?'}</div>
          <div><span className="font-medium">Model:</span> {config.model || '?'}</div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => switchProvider('mock')} className="px-3 py-2 bg-gray-600 text-white rounded-lg">Switch to Mock</button>
          <button onClick={() => switchProvider('deepseek')} className="px-3 py-2 bg-blue-600 text-white rounded-lg">Activate DeepSeek</button>
          <button onClick={testConn} disabled={testing} className="px-3 py-2 bg-green-600 text-white rounded-lg">{testing ? 'Testing...' : 'Test Connection'}</button>
        </div>
        {status && <div className="mt-3 text-sm text-gray-700">{status}</div>}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload .env File</h2>
        <input type="file" accept=".env,text/plain" onChange={(e) => setFile(e.target.files[0])} className="mb-3" />
        <button onClick={uploadEnv} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Upload and Save</button>
        <p className="text-xs text-gray-500 mt-2">Only DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL are accepted</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Configuration</h2>
        <div className="space-y-3">
          <input type="password" placeholder="API Key" value={manual.apiKey} onChange={(e) => setManual({...manual, apiKey: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Base URL" value={manual.baseUrl} onChange={(e) => setManual({...manual, baseUrl: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Model (e.g., deepseek-chat)" value={manual.model} onChange={(e) => setManual({...manual, model: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <button onClick={saveManual} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Configuration</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
