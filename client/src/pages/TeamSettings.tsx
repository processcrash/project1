import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Users, UserPlus, Copy, Check, X, Crown, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: {
    id: string;
    userId: string;
    email: string;
    name: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
  }[];
}

export default function TeamSettings() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTeam();
  }, [id]);

  const loadTeam = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      setTeam(res.data);
    } catch (error) {
      console.error('Failed to load team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/teams/${id}/invitations`, {
        email: inviteEmail,
        role: inviteRole
      });
      const token = res.data.token;
      setInviteLink(`${window.location.origin}/join/${token}`);
      setInviteEmail('');
      toast.success('Invitation created!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create invitation');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/teams/${id}/members/${memberId}`);
      loadTeam();
      toast.success('Member removed');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member') => {
    try {
      await api.patch(`/teams/${id}/members/${memberId}`, { role });
      loadTeam();
      toast.success('Role updated');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Team not found</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5" />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
          <p className="text-gray-600">Team Settings</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="h-5 w-5" />
          Invite Member
        </button>
      </div>

      {/* Members */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members ({team.members.length})
        </h2>

        <div className="space-y-4">
          {team.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  {member.role === 'owner' ? (
                    <Crown className="h-5 w-5 text-yellow-600" />
                  ) : member.role === 'admin' ? (
                    <Shield className="h-5 w-5 text-primary-600" />
                  ) : (
                    <span className="text-primary-600 font-semibold">{member.name[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={member.role}
                  onChange={(e) => updateMemberRole(member.id, e.target.value as 'admin' | 'member')}
                  disabled={member.role === 'owner'}
                  className="input text-sm"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                {member.role !== 'owner' && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Invite Team Member</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {!inviteLink ? (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input w-full"
                    placeholder="colleague@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                    className="input w-full"
                  >
                    <option value="member">Member - Can view and create reviews</option>
                    <option value="admin">Admin - Can manage team and billing</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full">
                  Create Invitation
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Share this link with your team member:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="input w-full text-sm"
                  />
                  <button onClick={copyInviteLink} className="btn-secondary p-2">
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
                <button
                  onClick={() => { setInviteLink(''); setShowInviteModal(false); }}
                  className="btn-secondary w-full"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}