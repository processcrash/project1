import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects as projectsApi, reviews as reviewsApi } from '../utils/api';
import { Project, Review } from '../types';
import { ArrowLeft, Code, Copy, Check, RefreshCw, Play } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isReviewing, setIsReviewing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const [projectRes, reviewsRes] = await Promise.all([
        projectsApi.get(id!),
        reviewsApi.getByProject(id!)
      ]);
      setProject(projectRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Failed to load project:', error);
      navigate('/dashboard');
    }
  };

  const handleCopyApiKey = () => {
    if (project?.apiKey) {
      navigator.clipboard.writeText(project.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !id) return;

    setIsReviewing(true);
    try {
      await reviewsApi.create({ projectId: id, code, language: selectedLanguage });
      setCode('');
      loadProject();
    } catch (error) {
      console.error('Failed to create review:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Dashboard
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/projects/${id}/settings`)}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Code Review Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="h-5 w-5" />
              Submit Code for Review
            </h2>
            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programming Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="input w-full max-w-xs"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code
                </label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input w-full font-mono text-sm"
                  placeholder="Paste your code here..."
                  rows={15}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isReviewing || !code.trim()}
                className="btn-primary flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isReviewing ? 'Analyzing...' : 'Start Review'}
              </button>
            </form>
          </div>

          {/* Review Results */}
          {reviews.filter(r => r.status === 'completed' && r.result).map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Review Result</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {review.result?.score}/10
                  </div>
                  <p className="text-sm text-gray-500">Quality Score</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{review.result?.summary}</p>

              {review.result && review.result.stats.critical + review.result.stats.high + review.result.stats.medium + review.result.stats.low > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Issues Found</h4>
                  <div className="flex gap-4 text-sm mb-4">
                    {review.result.stats.critical > 0 && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                        {review.result.stats.critical} Critical
                      </span>
                    )}
                    {review.result.stats.high > 0 && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
                        {review.result.stats.high} High
                      </span>
                    )}
                    {review.result.stats.medium > 0 && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        {review.result.stats.medium} Medium
                      </span>
                    )}
                    {review.result.stats.low > 0 && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {review.result.stats.low} Low
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {review.result.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-sm opacity-75">Line {issue.line}</span>
                          <div className="flex-1">
                            <p className="font-medium">{issue.message}</p>
                            {issue.suggestion && (
                              <p className="text-sm mt-1 opacity-80">
                                <strong>Suggestion:</strong> {issue.suggestion}
                              </p>
                            )}
                            {issue.code && (
                              <pre className="mt-2 p-2 bg-black bg-opacity-10 rounded text-sm font-mono overflow-x-auto">
                                {issue.code}
                              </pre>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* API Key */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Key</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={project.apiKey}
                readOnly
                className="input w-full text-sm font-mono"
              />
              <button
                onClick={handleCopyApiKey}
                className="btn-secondary p-2"
                title="Copy API Key"
              >
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Use this key to integrate with GitHub Actions or CI/CD
            </p>
          </div>

          {/* Review History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review History</h3>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 10).map((review) => (
                  <div key={review.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      review.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : review.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}