import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Code, Folder, Github, Zap, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: 'Welcome to CodeSentinel',
    description: 'AI-powered code review that helps you ship better code faster.',
    icon: Code,
  },
  {
    id: 2,
    title: 'Create Your First Project',
    description: 'Add a project to start reviewing code. Each project gets its own API key.',
    icon: Folder,
  },
  {
    id: 3,
    title: 'Connect GitHub (Optional)',
    description: 'Enable automatic reviews on pull requests with our GitHub integration.',
    icon: Github,
  },
  {
    id: 4,
    title: "You're All Set!",
    description: 'Start reviewing code and catch bugs before they reach production.',
    icon: Zap,
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    toast.success('Welcome to CodeSentinel!');
    onComplete();
    navigate('/dashboard');
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((s, index) => (
            <div
              key={s.id}
              className={`h-2 w-8 rounded-full transition-colors ${
                index <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <StepIcon className="h-8 w-8 text-primary-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h2>
          <p className="text-gray-600 mb-8">{step.description}</p>

          {/* Step-specific content */}
          {currentStep === 1 && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Quick tip:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Name projects after your GitHub repos for easy identification</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You can add multiple projects for different codebases</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Each project gets a unique API key for CI/CD integration</span>
                </li>
              </ul>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">GitHub Integration:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Automatic reviews on pull requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Inline comments on specific lines</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Review status checks in GitHub UI</span>
                </li>
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 ${
                currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} of {steps.length}
            </span>

            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="btn-primary flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* User info */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Logged in as {user?.email}
        </p>
      </div>
    </div>
  );
}