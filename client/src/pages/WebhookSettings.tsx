import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../utils/api';
import { ArrowLeft, Webhook, Copy, Check, RefreshCw, Play, Pause, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
}

const AVAILABLE_EVENTS = [
  { id: 'review.completed', label: 'Review Completed', description: 'Triggered when a code review is finished' },
  { id: 'review.failed', label: 'Review Failed', description: 'Triggered when a review processing fails' },
  { id: 'issue.critical', label: 'Critical Issue Found', description: 'Triggered when a critical issue is detected' },
  { id: 'project.created', label: 'Project Created', description: 'Triggered when a new project is created' },
];

export default function WebhookSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: '1',
      name: 'GitHub Actions',
      url: `https://api.codesentinel.ai/webhooks/github`,
      events: ['review.completed'],
      active: true,
      createdAt: new Date().toISOString(),
      lastTriggered: new Date(Date.now() - 3600000).toISOString()
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const copyWebhookUrl = (url: string, webhookId: string) => {
    navigator.clipboard.writeText(url);
    setCopied(webhookId);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleWebhook = (webhookId: string) => {
    setWebhooks(webhooks.map(w =>
      w.id === webhookId ? { ...w, active: !w.active } : w
    ));
    toast.success('Webhook updated');
  };

  const deleteWebhook = (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    setWebhooks(webhooks.filter(w => w.id !== webhookId));
    toast.success('Webhook deleted');
  };

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    const newWebhook: WebhookEndpoint = {
      id: Date.now().toString(),
      name: newWebhookName,
      url: `https://api.codesentinel.ai/webhooks/${Date.now()}`,
      events: selectedEvents,
      active: true,
      createdAt: new Date().toISOString()
    };
    setWebhooks([...webhooks, newWebhook]);
    setShowAddModal(false);
    setNewWebhookName('');
    setSelectedEvents([]);
    toast.success('Webhook created');
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <div>
      <button
        onClick={() => navigate(`/projects/${id}/settings`)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Settings
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhook Configuration</h1>
          <p className="text-gray-600">Configure webhooks to receive notifications about your projects</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Webhook
        </button>
      </div>

      {/* Webhook List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  webhook.active ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Webhook className={`h-5 w-5 ${webhook.active ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                  <p className="text-sm text-gray-500 font-mono mt-1">{webhook.url}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {webhook.events.map((event) => (
                      <span key={event} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleWebhook(webhook.id)}
                  className={`p-2 rounded-lg ${
                    webhook.active
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={webhook.active ? 'Pause' : 'Activate'}
                >
                  {webhook.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => copyWebhookUrl(webhook.url, webhook.id)}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                  title="Copy URL"
                >
                  {copied === webhook.id ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="p-2 rounded-lg bg-gray-100 text-red-600 hover:bg-red-200"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {webhook.lastTriggered && (
              <p className="text-xs text-gray-400 mt-3">
                Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add Webhook Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Webhook</h2>

            <form onSubmit={handleAddWebhook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Name
                </label>
                <input
                  type="text"
                  value={newWebhookName}
                  onChange={(e) => setNewWebhookName(e.target.value)}
                  className="input w-full"
                  placeholder="My Webhook"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Events to Listen
                </label>
                <div className="space-y-2">
                  {AVAILABLE_EVENTS.map((event) => (
                    <label
                      key={event.id}
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => toggleEvent(event.id)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{event.label}</p>
                        <p className="text-sm text-gray-500">{event.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newWebhookName || selectedEvents.length === 0}
                  className="btn-primary"
                >
                  Create Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}