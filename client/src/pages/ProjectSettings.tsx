import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../utils/api';
import { ArrowLeft, Save, Trash2, Copy, Check, RefreshCw } from 'lucide-react';

export default function ProjectSettings() {
  const navigate = useNavigate();
  const [projectId] = useState(window.location.pathname.split('/')[2]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [language, setLanguage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState('');

  useState(() => {
    loadProject();
  });

  const loadProject = async () => {
    try {
      const res = await projectsApi.get(projectId);
      const data = res.data;
      setProject(data);
      setName(data.name);
      setDescription(data.description || '');
      setRepoUrl(data.repoUrl || '');
      setLanguage(data.language || '');
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await projectsApi.update(projectId, { name, description, repoUrl, language });
      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateKey = async () => {
    try {
      const res = await projectsApi.regenerateKey(projectId);
      setProject({ ...project, apiKey: res.data.apiKey });
      setMessage('API key regenerated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to regenerate key');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectsApi.delete(projectId);
      navigate('/dashboard');
    } catch (error) {
      setMessage('Failed to delete project');
      setDeleting(false);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(project?.apiKey || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(`/projects/${projectId}`)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Project
      </button>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Project Settings</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full"
                rows={3}
                placeholder="Brief description of your project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repository URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="input w-full"
                placeholder="https://github.com/owner/repo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input w-full"
              >
                <option value="">Select language</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Key</h2>
          <p className="text-sm text-gray-500 mb-4">
            Use this key to integrate with GitHub Actions or CI/CD pipelines.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={project.apiKey}
              readOnly
              className="input w-full font-mono text-sm"
            />
            <button onClick={handleCopyApiKey} className="btn-secondary p-2" title="Copy">
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </button>
            <button onClick={handleRegenerateKey} className="btn-secondary p-2" title="Regenerate">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-yellow-600 mt-3">
            Warning: Regenerating the key will invalidate the old one.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Once you delete a project, there is no going back. All reviews and data associated with this project will be permanently removed.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Project
            </button>
          ) : (
            <div className="border border-red-300 rounded-lg p-4 bg-red-50">
              <p className="text-sm text-red-700 mb-4">
                Are you absolutely sure? Type <strong>{project.name}</strong> to confirm.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete Forever'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}