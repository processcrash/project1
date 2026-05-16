import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: Date;
}

export interface Invitation {
  id: string;
  teamId: string;
  email: string;
  role: 'admin' | 'member';
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const teams: Map<string, Team> = new Map();
const invitations: Map<string, Invitation> = new Map();
const userTeams: Map<string, string[]> = new Map(); // userId -> teamIds

export const teamService = {
  createTeam(ownerId: string, ownerEmail: string, ownerName: string, name: string): Team {
    const team: Team = {
      id: uuidv4(),
      name,
      ownerId,
      members: [{
        id: uuidv4(),
        userId: ownerId,
        email: ownerEmail,
        name: ownerName,
        role: 'owner',
        joinedAt: new Date()
      }],
      createdAt: new Date()
    };
    teams.set(team.id, team);

    // Add team to user's teams
    const userTeamIds = userTeams.get(ownerId) || [];
    userTeamIds.push(team.id);
    userTeams.set(ownerId, userTeamIds);

    return team;
  },

  getTeam(teamId: string): Team | undefined {
    return teams.get(teamId);
  },

  getUserTeams(userId: string): Team[] {
    const teamIds = userTeams.get(userId) || [];
    return teamIds.map(id => teams.get(id)).filter(Boolean) as Team[];
  },

  getMember(teamId: string, userId: string): TeamMember | undefined {
    const team = teams.get(teamId);
    return team?.members.find(m => m.userId === userId);
  },

  isOwner(teamId: string, userId: string): boolean {
    const team = teams.get(teamId);
    return team?.ownerId === userId;
  },

  isAdmin(teamId: string, userId: string): boolean {
    const member = this.getMember(teamId, userId);
    return member?.role === 'owner' || member?.role === 'admin';
  },

  canManage(teamId: string, userId: string): boolean {
    return this.isAdmin(teamId, userId);
  },

  createInvitation(teamId: string, email: string, role: 'admin' | 'member', expiresInHours = 72): Invitation {
    const invitation: Invitation = {
      id: uuidv4(),
      teamId,
      email,
      role,
      token: uuidv4(),
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
      createdAt: new Date()
    };
    invitations.set(invitation.token, invitation);
    return invitation;
  },

  getInvitation(token: string): Invitation | undefined {
    const invitation = invitations.get(token);
    if (invitation && invitation.expiresAt > new Date()) {
      return invitation;
    }
    return undefined;
  },

  acceptInvitation(token: string, userId: string, userEmail: string, userName: string): Team | undefined {
    const invitation = this.getInvitation(token);
    if (!invitation) {
      throw new AppError('Invitation expired or invalid', 400);
    }

    const team = teams.get(invitation.teamId);
    if (!team) {
      throw new AppError('Team not found', 404);
    }

    // Check if already a member
    const existingMember = team.members.find(m => m.email === invitation.email);
    if (existingMember) {
      throw new AppError('Already a team member', 400);
    }

    // Add member
    const member: TeamMember = {
      id: uuidv4(),
      userId,
      email: invitation.email,
      name: userName,
      role: invitation.role,
      joinedAt: new Date()
    };
    team.members.push(member);

    // Add team to user's teams
    const userTeamIds = userTeams.get(userId) || [];
    userTeamIds.push(team.id);
    userTeams.set(userId, userTeamIds);

    // Remove invitation
    invitations.delete(token);

    return team;
  },

  removeMember(teamId: string, memberId: string, requesterId: string): void {
    const team = teams.get(teamId);
    if (!team) {
      throw new AppError('Team not found', 404);
    }

    const member = team.members.find(m => m.id === memberId);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    // Can't remove owner
    if (member.role === 'owner') {
      throw new AppError('Cannot remove team owner', 400);
    }

    // Check permissions
    if (!this.isAdmin(teamId, requesterId)) {
      throw new AppError('Not authorized', 403);
    }

    team.members = team.members.filter(m => m.id !== memberId);

    // Remove from user's teams
    const userTeamIds = userTeams.get(member.userId) || [];
    userTeams.set(member.userId, userTeamIds.filter(id => id !== teamId));
  },

  updateMemberRole(teamId: string, memberId: string, newRole: 'admin' | 'member', requesterId: string): void {
    const team = teams.get(teamId);
    if (!team) {
      throw new AppError('Team not found', 404);
    }

    // Only owner can change roles
    if (!this.isOwner(teamId, requesterId)) {
      throw new AppError('Only owner can change roles', 403);
    }

    const member = team.members.find(m => m.id === memberId);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    if (member.role === 'owner') {
      throw new AppError('Cannot change owner role', 400);
    }

    member.role = newRole;
  },

  cancelInvitation(token: string, requesterId: string): void {
    const invitation = invitations.get(token);
    if (!invitation) {
      throw new AppError('Invitation not found', 404);
    }

    const team = teams.get(invitation.teamId);
    if (!team || !this.isAdmin(invitation.teamId, requesterId)) {
      throw new AppError('Not authorized', 403);
    }

    invitations.delete(token);
  }
};