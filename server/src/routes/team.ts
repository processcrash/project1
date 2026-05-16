import { Router } from 'express';
import { teamService } from '../services/teamService';
import { authenticate } from '../middleware/authenticate';
import { authService } from '../services/authService';

export const teamRouter = Router();

teamRouter.use(authenticate);

// Create a team
teamRouter.post('/', (req, res, next) => {
  try {
    const user = authService.getUserById(req.user!.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { name } = req.body;
    const team = teamService.createTeam(req.user!.userId, user.email, user.name, name);
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
});

// List user's teams
teamRouter.get('/', (req, res) => {
  const teams = teamService.getUserTeams(req.user!.userId);
  res.json(teams);
});

// Get team details
teamRouter.get('/:id', (req, res) => {
  const team = teamService.getTeam(req.params.id);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  const member = teamService.getMember(req.params.id, req.user!.userId);
  if (!member) {
    return res.status(403).json({ error: 'Not a team member' });
  }

  res.json(team);
});

// Update team
teamRouter.patch('/:id', (req, res) => {
  if (!teamService.isAdmin(req.params.id, req.user!.userId)) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const team = teamService.getTeam(req.params.id);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  const { name } = req.body;
  if (name) {
    team.name = name;
  }

  res.json(team);
});

// Create invitation
teamRouter.post('/:id/invitations', (req, res) => {
  if (!teamService.canManage(req.params.id, req.user!.userId)) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { email, role } = req.body;
  if (!email || !['admin', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Invalid email or role' });
  }

  const invitation = teamService.createInvitation(req.params.id, email, role);
  res.status(201).json(invitation);
});

// List invitations
teamRouter.get('/:id/invitations', (req, res) => {
  // This would need to track invitations by team - simplified for now
  res.json([]);
});

// Accept invitation
teamRouter.post('/invitations/:token/accept', (req, res) => {
  try {
    const user = authService.getUserById(req.user!.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const team = teamService.acceptInvitation(
      req.params.token,
      req.user!.userId,
      user.email,
      user.name
    );
    res.json({ message: 'Joined team successfully', team });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Remove member
teamRouter.delete('/:id/members/:memberId', (req, res) => {
  try {
    teamService.removeMember(req.params.id, req.params.memberId, req.user!.userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update member role
teamRouter.patch('/:id/members/:memberId', (req, res) => {
  try {
    const { role } = req.body;
    teamService.updateMemberRole(req.params.id, req.params.memberId, role, req.user!.userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});