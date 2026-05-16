import { Link } from 'react-router-dom';
import { Shield, Zap, Github, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="font-bold text-xl text-gray-900">CodeSentinel</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI-Powered Code Review
          <br />
          <span className="text-primary-600">That Actually Works</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Catch bugs, security vulnerabilities, and code quality issues before they reach production.
          Powered by GPT-4 and Claude AI.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Start Free Trial
          </Link>
          <a
            href="#features"
            className="btn-secondary text-lg px-8 py-3"
          >
            Learn More
          </a>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Reviews</h3>
            <p className="text-gray-600">
              Get detailed code reviews in seconds, not hours. AI analyzes your code and provides
              actionable feedback immediately.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Security First</h3>
            <p className="text-gray-600">
              Automatically detect security vulnerabilities, injection risks, and authentication
              issues before they become problems.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Github className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">GitHub Integration</h3>
            <p className="text-gray-600">
              Seamlessly integrate with your GitHub workflow. Automatic reviews on pull requests
              with inline comments.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Trusted by Developers Worldwide</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of developers who ship better code with CodeSentinel
          </p>
          <div className="flex justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
            <span>•</span>
            <span>10,000+ Reviews</span>
            <span>•</span>
            <span>99.9% Uptime</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
          <p className="text-gray-600">Start free, scale as you grow</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white border-2 border-gray-200 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-gray-500">/mo</span></div>
            <p className="text-gray-600 mb-6">Perfect for personal projects</p>
            <ul className="space-y-3 text-gray-600 mb-8">
              <li>3 Projects</li>
              <li>100 reviews/month</li>
              <li>Community support</li>
            </ul>
            <Link to="/register" className="btn-secondary w-full block text-center">
              Get Started
            </Link>
          </div>
          <div className="bg-primary-600 text-white p-8 rounded-2xl relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
              Popular
            </div>
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-4">$15<span className="text-lg text-primary-200">/mo</span></div>
            <p className="text-primary-100 mb-6">For professional developers</p>
            <ul className="space-y-3 text-primary-100 mb-8">
              <li>Unlimited Projects</li>
              <li>1000 reviews/month</li>
              <li>Priority Support</li>
              <li>GitHub Integration</li>
            </ul>
            <Link to="/register" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold w-full block text-center hover:bg-primary-50">
              Start Free Trial
            </Link>
          </div>
          <div className="bg-white border-2 border-gray-200 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2">Team</h3>
            <div className="text-4xl font-bold mb-4">$49<span className="text-lg text-gray-500">/mo</span></div>
            <p className="text-gray-600 mb-6">For growing teams</p>
            <ul className="space-y-3 text-gray-600 mb-8">
              <li>Unlimited Reviews</li>
              <li>Team Management</li>
              <li>Slack Notifications</li>
              <li>Dedicated Support</li>
            </ul>
            <Link to="/register" className="btn-secondary w-full block text-center">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2026 CodeSentinel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}