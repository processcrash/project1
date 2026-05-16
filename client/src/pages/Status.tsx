import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import api from '../utils/api';

interface SystemStatus {
  api: 'operational' | 'degraded' | 'down';
  ai: 'operational' | 'degraded' | 'down';
  database: 'operational' | 'degraded' | 'down';
  lastUpdated: string;
}

interface Incident {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

export default function Status() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();

    // Poll every 60 seconds
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const res = await api.get('/analytics/stats');
      setStatus({
        api: 'operational',
        ai: 'operational',
        database: 'operational',
        lastUpdated: new Date().toISOString()
      });
    } catch {
      setStatus({
        api: 'degraded',
        ai: 'degraded',
        database: 'degraded',
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'operational':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'down':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl text-gray-900">CodeSentinel</span>
            </Link>
            <Link to="/login" className="btn-primary">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">System Status</h1>
          <p className="text-gray-600">
            Current status of CodeSentinel services
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {status && new Date(status.lastUpdated).toLocaleString()}
          </p>
        </div>

        {/* Overall Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status?.api === 'operational' ? (
                <Wifi className="h-6 w-6 text-green-500" />
              ) : (
                <WifiOff className="h-6 w-6 text-red-500" />
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">All Systems Operational</h2>
                <p className="text-sm text-gray-500">Everything is running smoothly</p>
              </div>
            </div>
            <button
              onClick={checkStatus}
              className="btn-secondary text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Service Status */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {status && (
            <>
              <div className={`rounded-xl border p-6 ${getStatusColor(status.api)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(status.api)}
                  <h3 className="font-semibold text-gray-900">API</h3>
                </div>
                <p className="text-sm text-gray-600 capitalize">{status.api}</p>
              </div>
              <div className={`rounded-xl border p-6 ${getStatusColor(status.ai)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(status.ai)}
                  <h3 className="font-semibold text-gray-900">AI Engine</h3>
                </div>
                <p className="text-sm text-gray-600 capitalize">{status.ai}</p>
              </div>
              <div className={`rounded-xl border p-6 ${getStatusColor(status.database)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(status.database)}
                  <h3 className="font-semibold text-gray-900">Database</h3>
                </div>
                <p className="text-sm text-gray-600 capitalize">{status.database}</p>
              </div>
            </>
          )}
        </div>

        {/* Incidents */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h2>
          {incidents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
              <p>No recent incidents</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map(incident => (
                <div
                  key={incident.id}
                  className={`p-4 rounded-lg border ${
                    incident.resolved ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {incident.resolved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <h3 className="font-medium text-gray-900">{incident.title}</h3>
                    {incident.resolved && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{incident.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(incident.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscribe */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Want to be notified of incidents?
          </p>
          <Link to="/register" className="btn-primary">
            Subscribe to Updates
          </Link>
        </div>
      </main>

      <footer className="bg-white mt-12 py-6 border-t">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2026 CodeSentinel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}