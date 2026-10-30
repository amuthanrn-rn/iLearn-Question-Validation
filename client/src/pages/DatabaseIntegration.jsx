import { useEffect, useState } from 'react';
import axios from 'axios';

const DatabaseIntegration = () => {
  const [form, setForm] = useState({ name: 'iLearn DB', host: 'localhost', port: 5432, database: '', username: 'postgres', password: '', ssl: false });
  const [status, setStatus] = useState({ connected: false });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState({ schema: '', table: '' });
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({ questionId: '', questionText: '', answer: '', explanation: '', subject: '', chapter: '' });
  const [preview, setPreview] = useState([]);
  const [sqlFile, setSqlFile] = useState(null);
  const [importStatus, setImportStatus] = useState('');

  const loadStatus = () => {
    axios.get('http://localhost:5002/api/database/status').then(res => setStatus(res.data)).catch(() => {});
  };

  useEffect(() => { loadStatus(); }, []);

  const test = async () => {
    setTesting(true);
    try {
      const res = await axios.post('http://localhost:5002/api/database/test', form);
      alert(res.data.success ? 'Connection successful' : 'Failed');
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    } finally {
      setTesting(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.post('http://localhost:5002/api/database/connections', form);
      loadStatus();
      alert('Saved');
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async () => {
    await axios.post('http://localhost:5002/api/database/disconnect');
    loadStatus();
    alert('Disconnected');
  };

  const loadTables = async () => {
    try {
      const res = await axios.get('http://localhost:5002/api/database/tables');
      setTables(res.data);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  const loadColumns = async () => {
    try {
      const res = await axios.get('http://localhost:5002/api/database/columns', { params: { schema: selected.schema, table: selected.table } });
      setColumns(res.data);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  const selectTable = (t) => {
    setSelected({ schema: t.schemaname, table: t.tablename });
    setTimeout(loadColumns, 100);
  };

  const saveMapping = async () => {
    try {
      await axios.post('http://localhost:5002/api/database/mapping', { schema: selected.schema, table: selected.table, mappings: mapping });
      alert('Mapping saved');
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  const previewData = async () => {
    try {
      const res = await axios.get('http://localhost:5002/api/database/preview');
      setPreview(res.data);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  const uploadSql = async () => {
    if (!sqlFile) return;
    const formData = new FormData();
    formData.append('sqlFile', sqlFile);
    setImportStatus('Uploading...');
    try {
      const res = await axios.post('http://localhost:5002/api/import/upload', formData);
      setImportStatus(res.data.message || 'Uploaded');
      alert('File uploaded. Import requires isolated environment setup.');
    } catch (e) {
      setImportStatus('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Database Integration</h1>
        <p className="text-gray-600 mt-1">Connect and manage your iLearn PostgreSQL question bank</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">PostgreSQL Connection</h2>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Connection Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input placeholder="Host" value={form.host} onChange={(e) => setForm({...form, host: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="number" placeholder="Port" value={form.port} onChange={(e) => setForm({...form, port: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input placeholder="Database Name" value={form.database} onChange={(e) => setForm({...form, database: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={test} disabled={testing} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{testing ? 'Testing...' : 'Test Connection'}</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg">{saving ? 'Saving...' : 'Save Connection'}</button>
          <button onClick={disconnect} className="px-4 py-2 bg-red-600 text-white rounded-lg">Disconnect</button>
          <button onClick={loadStatus} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Refresh Status</button>
        </div>
        <div className="mt-3 text-sm">Status: {status.connected ? 'Connected' : 'Not Configured'}</div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Local SQL Database</h2>
        <input type="file" accept=".sql" onChange={(e) => setSqlFile(e.target.files[0])} className="mb-3" />
        {sqlFile && <div className="text-sm text-gray-600 mb-2">File: {sqlFile.name} ({Math.round(sqlFile.size/1024)} KB)</div>}
        <button onClick={uploadSql} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Upload SQL File</button>
        {importStatus && <div className="mt-2 text-sm text-gray-700">{importStatus}</div>}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Explorer</h2>
        <button onClick={loadTables} className="px-4 py-2 bg-blue-600 text-white rounded-lg mb-4">Load Tables</button>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Schema</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Table</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Select</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tables.map((t, idx) => (
                <tr key={idx} onClick={() => selectTable(t)} className="cursor-pointer hover:bg-blue-50">
                  <td className="px-4 py-2 text-sm">{t.schemaname}</td>
                  <td className="px-4 py-2 text-sm">{t.tablename}</td>
                  <td className="px-4 py-2"><span className="text-blue-600">Select</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected.table && <div className="mt-3 text-sm font-medium">Selected Table: {selected.schema}.{selected.table}</div>}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Field Mapping</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input placeholder="Question ID Column" value={mapping.questionId} onChange={(e) => setMapping({...mapping, questionId: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input placeholder="Question Text Column" value={mapping.questionText} onChange={(e) => setMapping({...mapping, questionText: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input placeholder="Answer Column" value={mapping.answer} onChange={(e) => setMapping({...mapping, answer: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input placeholder="Explanation Column" value={mapping.explanation} onChange={(e) => setMapping({...mapping, explanation: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input placeholder="Subject Column" value={mapping.subject} onChange={(e) => setMapping({...mapping, subject: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input placeholder="Chapter Column" value={mapping.chapter} onChange={(e) => setMapping({...mapping, chapter: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <button onClick={saveMapping} className="px-4 py-2 bg-blue-600 text-white rounded-lg mr-2">Save Mapping</button>
        <button onClick={previewData} className="px-4 py-2 bg-green-600 text-white rounded-lg">Preview Questions</button>
      </div>

      {preview.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview (Sample)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(preview[0]).slice(0, 6).map((k, idx) => (
                    <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).slice(0, 6).map((v, i) => (
                      <td key={i} className="px-4 py-2 text-sm max-w-xs truncate">{String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseIntegration;
