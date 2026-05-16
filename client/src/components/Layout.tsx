import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, LogOut, User, CreditCard, LayoutDashboard } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary-600" />
                <span className="font-bold text-xl text-gray-900">CodeSentinel</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/billing"
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                <CreditCard className="h-5 w-5" />
                <span>Billing</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-5 w-5" />
                <span>{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}