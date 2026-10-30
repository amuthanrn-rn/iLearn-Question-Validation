import { useEffect, useState } from 'react';
import { FileQuestion, CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';
import axios from 'axios';

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={"p-3 rounded-lg " + color}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [healthStatus, setHealthStatus] = useState('checking');
  const [stats, setStats] = useState({ total: null, loading: true });

  useEffect(() => {
    axios.get('http://localhost:5002/health')
      .then(res => {
        setHealthStatus(res.data.status === 'ok' ? 'connected' : 'disconnected');
      })
      .catch(() => setHealthStatus('disconnected'));

    axios.get('http://localhost:5002/api/questions/stats')
      .then(res => {
        setStats({ total: res.data.total, loading: false });
      })
      .catch(() => setStats({ total: null, loading: false }));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of question validation status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.loading ? '...' : (stats.total === null ? '?' : stats.total)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FileQuestion size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validated Questions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">?</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Correct Questions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">?</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Incorrect Questions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">?</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500">
              <XCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Questions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">?</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500">
              <AlertCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="flex items-center gap-3">
            <Activity size={20} className={healthStatus === 'connected' ? 'text-green-500' : healthStatus === 'disconnected' ? 'text-red-500' : 'text-gray-400'} />
            <span className="text-gray-700">Backend: {healthStatus === 'connected' ? 'Connected' : healthStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h2>
          <p className="text-gray-600">iLearn AI Question Validator - Ready for PostgreSQL and DeepSeek AI integration</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
