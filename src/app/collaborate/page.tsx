'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Users, MessageSquare, CheckCircle, Clock, AlertCircle, Plus,
  UserPlus, Settings, Activity, Calendar, Target, Award,
  TrendingUp, Filter, Download, Send, Edit, Trash2, LogIn
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { useRealtime } from '@/contexts/realtime-context';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ExportDialog } from '@/components/export-dialog';

const STATUS_COLORS = {
  planning: '#6b7280',
  in_progress: '#3b82f6',
  completed: '#10b981',
  on_hold: '#f59e0b'
};

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626'
};

async function fetchCollaborationData(teamId: string) {
  const response = await fetch(`/api/collaborate?team_id=${teamId}&include_activity=true`);
  if (!response.ok) throw new Error('Failed to fetch collaboration data');
  return response.json();
}

async function createTeam(data: { name: string; description: string }) {
  const response = await fetch('/api/collaborate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_team', ...data })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create team');
  }
  return response.json();
}

async function updateProjectStatus(data: { teamId: string; projectId: string; status: string }) {
  const response = await fetch('/api/collaborate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update_project_status', ...data })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update project status');
  }
  return response.json();
}

async function updateProjectPriority(data: { teamId: string; projectId: string; priority: string }) {
  const response = await fetch('/api/collaborate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update_project_priority', ...data })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update project priority');
  }
  return response.json();
}

async function updateProjectProgress(data: { teamId: string; projectId: string; progress: number }) {
  const response = await fetch('/api/collaborate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update_project_progress', ...data })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update project progress');
  }
  return response.json();
}

async function addComment(data: { projectId: string; content: string; type?: string; rating?: number }) {
  const response = await fetch('/api/collaborate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'add_comment', ...data })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add comment');
  }
  return response.json();
}

async function inviteMember(data: { teamId: string; email: string; role: string }) {
  const response = await fetch('/api/collaborate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'invite_member', ...data })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to invite member');
  }
  return response.json();
}

async function assignProject(data: { teamId: string; projectId: string }) {
  const response = await fetch('/api/collaborate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'assign_project', ...data })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign project');
  }
  return response.json();
}

export default function CollaboratePage() {
  const { user, loading: authLoading } = useAuth();
  const { 
    connected,
    emitProjectStatusChange,
    emitNewComment,
    emitActivity,
    subscribeToTeamUpdates,
    subscribeToActivities
  } = useRealtime();
  
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [commentContent, setCommentContent] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const { data: collaborationData, isLoading, error } = useQuery({
    queryKey: ['collaboration', selectedTeam],
    queryFn: () => fetchCollaborationData(selectedTeam),
    enabled: !!user && !!selectedTeam,
  });

  // Set the first team as selected when data loads
  useEffect(() => {
    if (collaborationData?.teams?.length > 0 && !selectedTeam) {
      setSelectedTeam(collaborationData.teams[0].id);
    }
  }, [collaborationData, selectedTeam]);

  // Set up realtime listeners
  useEffect(() => {
    if (!selectedTeam) return;

    // Listen for team updates
    const unsubscribe = subscribeToTeamUpdates(selectedTeam, (data) => {
      queryClient.invalidateQueries({ queryKey: ['collaboration', selectedTeam] });
      
      if (data.type === 'project_status_changed') {
        toast.success(`Project status updated to ${data.status}`);
      } else if (data.type === 'comment_added' && data.comment?.user?.id !== user?.id) {
        toast(`New comment on project`, { icon: '💬' });
      } else if (data.type === 'activity_added' && data.activity) {
        // Handle typing indicators
        if (data.activity.type === 'typing_start' && data.activity.userId !== user?.id) {
          setTypingUsers(prev => {
            const projectId = data.activity.projectId;
            const users = new Set(prev[projectId] || []);
            users.add(data.activity.userName || 'Someone');
            return { ...prev, [projectId]: users };
          });
        } else if (data.activity.type === 'typing_stop' && data.activity.userId !== user?.id) {
          setTypingUsers(prev => {
            const projectId = data.activity.projectId;
            const users = new Set(prev[projectId] || []);
            users.delete(data.activity.userName || 'Someone');
            if (users.size === 0) {
              const { [projectId]: _, ...rest } = prev;
              return rest;
            }
            return { ...prev, [projectId]: users };
          });
        }
      }
    });

    return () => {
      unsubscribe();
      // Clear typing timeout on unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedTeam, queryClient, subscribeToTeamUpdates, user]);

  // Subscribe to global activities for real-time feed
  useEffect(() => {
    const unsubscribe = subscribeToActivities((activity) => {
      // Update the activity feed in real-time
      queryClient.setQueryData(['collaboration', selectedTeam], (oldData: any) => {
        if (!oldData || !oldData.recentActivity) return oldData;
        
        // Prepend new activity to the list
        const newActivity = {
          ...activity,
          id: `realtime-${Date.now()}`,
          createdAt: activity.timestamp || new Date()
        };
        
        return {
          ...oldData,
          recentActivity: [newActivity, ...oldData.recentActivity].slice(0, 20) // Keep last 20 activities
        };
      });
      
      // Show toast for important activities
      if (activity.type === 'project_completed' && activity.userId !== user?.id) {
        toast.success(`${activity.userName || 'Someone'} completed a project!`, { icon: '🎉' });
      }
    });

    return unsubscribe;
  }, [subscribeToActivities, queryClient, selectedTeam, user]);

  const createTeamMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: (data) => {
      toast.success('Team created successfully!');
      setShowCreateTeamDialog(false);
      setNewTeamName('');
      setNewTeamDescription('');
      queryClient.invalidateQueries({ queryKey: ['collaboration'] });
      if (data.team) {
        setSelectedTeam(data.team.id);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create team');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateProjectStatus,
    onSuccess: (data, variables) => {
      toast.success('Status updated!');
      queryClient.invalidateQueries({ queryKey: ['collaboration', selectedTeam] });
      // Emit realtime event for updates
      emitProjectStatusChange(variables.projectId, variables.teamId, variables.status);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    }
  });

  const updatePriorityMutation = useMutation({
    mutationFn: updateProjectPriority,
    onSuccess: (data, variables) => {
      toast.success('Priority updated!');
      queryClient.invalidateQueries({ queryKey: ['collaboration', selectedTeam] });
      // Emit realtime event for updates
      emitProjectStatusChange(variables.projectId, variables.teamId, variables.priority);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update priority');
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: updateProjectProgress,
    onSuccess: (data, variables) => {
      toast.success('Progress updated!');
      queryClient.invalidateQueries({ queryKey: ['collaboration', selectedTeam] });
      // Emit realtime event for updates
      emitProjectStatusChange(variables.projectId, variables.teamId, variables.progress.toString());
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update progress');
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: (data, variables) => {
      toast.success('Comment added!');
      setCommentContent('');
      queryClient.invalidateQueries({ queryKey: ['collaboration', selectedTeam] });
      // Emit realtime event for updates
      if (data.comment) {
        emitNewComment(variables.projectId, selectedTeam, data.comment);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    }
  });

  const inviteMemberMutation = useMutation({
    mutationFn: inviteMember,
    onSuccess: () => {
      toast.success('Invitation sent!');
      setInviteEmail('');
      setInviteRole('member');
      queryClient.invalidateQueries({ queryKey: ['collaboration', selectedTeam] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to invite member');
    }
  });

  const assignProjectMutation = useMutation({
    mutationFn: assignProject,
    onSuccess: () => {
      toast.success('Project assigned!');
      queryClient.invalidateQueries({ queryKey: ['collaboration', selectedTeam] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign project');
    }
  });

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Team Collaboration</h1>
          <p className="text-muted-foreground">Please log in to access collaboration features</p>
          <Link href="/login">
            <Button>
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get current team data
  const currentTeam = collaborationData?.teams?.find(t => t.id === selectedTeam);
  
  // If no teams, show create team prompt
  if (!collaborationData?.teams?.length) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Team Collaboration</h1>
          <p className="text-muted-foreground">You're not part of any teams yet</p>
          <Button onClick={() => setShowCreateTeamDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Team
          </Button>
          <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Create a team to start collaborating on projects.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="team-name" className="text-right">Name</Label>
                  <Input 
                    id="team-name" 
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="col-span-3" 
                    placeholder="My Awesome Team"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="team-desc" className="text-right">Description</Label>
                  <Textarea 
                    id="team-desc" 
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    className="col-span-3" 
                    placeholder="What's your team about?"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => createTeamMutation.mutate({ 
                    name: newTeamName, 
                    description: newTeamDescription 
                  })}
                  disabled={!newTeamName.trim() || createTeamMutation.isPending}
                >
                  {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (error || !currentTeam) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Collaboration</h1>
          <p className="text-muted-foreground">Failed to load collaboration data</p>
        </div>
      </div>
    );
  }

  // Process data for display
  const recentActivity = collaborationData.recentActivity || [];
  const userRole = collaborationData.userRole || 'member';
  
  // Calculate project statistics
  const projectStats = {
    total: currentTeam.projects?.length || 0,
    byStatus: {
      planning: 0,
      in_progress: 0,
      completed: 0,
      on_hold: 0,
      assigned: 0
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    }
  };

  currentTeam.projects?.forEach(p => {
    if (projectStats.byStatus[p.status]) {
      projectStats.byStatus[p.status]++;
    }
    // Use actual priority from project
    const priority = p.priority || 'medium';
    if (projectStats.byPriority[priority]) {
      projectStats.byPriority[priority]++;
    }
  });

  const completionRate = projectStats.total > 0 
    ? (projectStats.byStatus.completed / projectStats.total) * 100 
    : 0;

  // Calculate member contributions from real data
  const memberContributions = currentTeam.members?.map(member => {
    // Count activities by this member
    const memberActivities = recentActivity.filter(a => a.user?.id === member.userId);
    const activitiesCount = memberActivities.length;
    
    // Count projects assigned to this member (through team projects)
    const projectsAssigned = currentTeam.projects?.filter(p => 
      p.assignedAt && new Date(p.assignedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length || 0;
    
    // Count comments made by this member
    const commentsMade = memberActivities.filter(a => a.type === 'comment_added').length;
    
    // Calculate activity score based on real metrics
    // Score = (activities * 2) + (projects * 10) + (comments * 5), capped at 100
    const activityScore = Math.min(100, (activitiesCount * 2) + (projectsAssigned * 10) + (commentsMade * 5));
    
    return {
      userId: member.id,
      userName: member.name,
      activityScore,
      projectsAssigned,
      commentsMade
    };
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'on_hold': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const handleStatusUpdate = (projectId: string, newStatus: string) => {
    if (!selectedTeam) return;
    updateStatusMutation.mutate({ teamId: selectedTeam, projectId, status: newStatus });
  };

  const handlePriorityUpdate = (projectId: string, newPriority: string) => {
    if (!selectedTeam) return;
    updatePriorityMutation.mutate({ teamId: selectedTeam, projectId, priority: newPriority });
  };

  const handleProgressUpdate = (projectId: string, newProgress: number) => {
    if (!selectedTeam || isNaN(newProgress)) return;
    const progress = Math.max(0, Math.min(100, newProgress));
    updateProgressMutation.mutate({ teamId: selectedTeam, projectId, progress });
  };

  const handleAddComment = () => {
    if (!commentContent.trim() || !selectedProject) return;
    
    addCommentMutation.mutate({
      projectId: selectedProject,
      content: commentContent,
      type: 'comment'
    });
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim() || !selectedTeam) return;
    
    inviteMemberMutation.mutate({
      teamId: selectedTeam,
      email: inviteEmail,
      role: inviteRole
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <span>Team Collaboration</span>
            </h1>
            <p className="text-muted-foreground">
              {currentTeam.name} - {currentTeam.memberCount} members working on {currentTeam.projectCount} projects
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join the {currentTeam.name} team.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleInviteMember}
                    disabled={!inviteEmail.trim() || inviteMemberMutation.isPending}
                  >
                    {inviteMemberMutation.isPending ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <ExportDialog
              projectIds={currentTeam.projects?.map(p => p.id)}
              reportType="summary"
              triggerText="Export Report"
            />
          </div>
        </div>

        {/* Team Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {completionRate.toFixed(0)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.byStatus.in_progress + projectStats.byStatus.assigned}</div>
              <p className="text-xs text-muted-foreground">
                Currently in development
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentTeam.memberCount}</div>
              <p className="text-xs text-muted-foreground">
                Active collaborators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentActivity.length}</div>
              <p className="text-xs text-muted-foreground">
                Actions this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Collaboration Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Project List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Projects</CardTitle>
                    <CardDescription>Current project status and progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentTeam.projects?.map((project: any) => (
                        <div key={project.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getStatusIcon(project.status)}
                                <h4 className="font-medium">{project.title || 'Untitled Project'}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {project.status}
                                </Badge>
                                <Badge variant={getPriorityBadgeVariant(project.priority || 'medium')} className="text-xs">
                                  {project.priority || 'medium'}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">Assigned {formatDistanceToNow(new Date(project.assignedAt), { addSuffix: true })}</p>
                              
                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs font-medium">Comments:</span>
                                  <span className="text-xs">{project.commentsCount || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs font-medium">Progress:</span>
                                  <span className="text-xs">{project.progress || 0}%</span>
                                </div>
                              </div>
                              
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${project.progress || 0}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <Select 
                                  value={project.status} 
                                  onValueChange={(value) => handleStatusUpdate(project.id, value)}
                                >
                                  <SelectTrigger className="w-32 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="planning">Planning</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="on_hold">On Hold</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <Select 
                                  value={project.priority || 'medium'} 
                                  onValueChange={(value) => handlePriorityUpdate(project.id, value)}
                                >
                                  <SelectTrigger className="w-28 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={project.progress || 0}
                                  onChange={(e) => handleProgressUpdate(project.id, parseInt(e.target.value))}
                                  className="w-20 h-8"
                                  placeholder="0%"
                                />
                              </div>

                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Project Stats */}
              <div className="space-y-6">
                {/* Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={Object.entries(projectStats.byStatus).filter(([_, count]) => count > 0).map(([status, count]) => ({
                            name: status.replace('_', ' '),
                            value: count,
                            fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280'
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {Object.entries(projectStats.byStatus).filter(([_, count]) => count > 0).map((_, index) => (
                            <Cell key={`cell-${index}`} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Team Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Your Teams</span>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCreateTeamDialog(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {collaborationData.teams.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => setSelectedTeam(team.id)}
                          className={`w-full p-3 text-left rounded-lg border transition-colors ${
                            selectedTeam === team.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="font-medium">{team.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {team.memberCount} members • {team.projectCount} projects
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Team Members */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>{currentTeam.members?.length || 0} active members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentTeam.members?.map((member) => (
                        <div key={member.id} className="p-4 border rounded-lg">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{member.name}</h4>
                                  <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                                <Badge variant={member.role === 'owner' ? 'default' : 'outline'}>
                                  {member.role}
                                </Badge>
                              </div>
                              

                              <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                                <span>Joined: {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Member Contributions */}
              <Card>
                <CardHeader>
                  <CardTitle>Contributions</CardTitle>
                  <CardDescription>Team member activity scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {memberContributions
                      .sort((a, b) => b.activityScore - a.activityScore)
                      .map((contribution) => (
                      <div key={contribution.userId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{contribution.userName}</span>
                          <span className="text-sm font-bold">{contribution.activityScore}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${contribution.activityScore}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{contribution.projectsAssigned} projects</span>
                          <span>{contribution.commentsMade} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <span>Recent Activity</span>
                      {connected && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                          Live
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Team activity and project updates</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['collaboration', selectedTeam] })}
                  >
                    <Activity className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user?.avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{activity.user?.name || 'Unknown'}</span>
                          <span className="text-sm text-muted-foreground">{activity.description}</span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </div>

                        {activity.project && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Project: {activity.project.title}
                          </div>
                        )}
                        {activity.team && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Team: {activity.team.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <span>Add Comment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project to comment on" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentTeam.projects?.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Textarea
                    placeholder="Add your comment or feedback..."
                    value={commentContent}
                    onChange={(e) => {
                      setCommentContent(e.target.value);
                      
                      // Handle typing indicator
                      if (e.target.value && selectedProject) {
                        // Clear existing timeout
                        if (typingTimeoutRef.current) {
                          clearTimeout(typingTimeoutRef.current);
                        }
                        
                        // Emit typing start (simulated via activity)
                        emitActivity({
                          type: 'typing_start',
                          projectId: selectedProject,
                          userId: user?.id,
                          userName: user?.name
                        }, selectedTeam);
                        
                        // Set timeout to stop typing
                        typingTimeoutRef.current = setTimeout(() => {
                          emitActivity({
                            type: 'typing_stop',
                            projectId: selectedProject,
                            userId: user?.id
                          }, selectedTeam);
                        }, 2000);
                      }
                    }}
                    className="min-h-[100px]"
                  />
                  
                  {/* Typing indicators */}
                  {typingUsers[selectedProject] && typingUsers[selectedProject].size > 0 && (
                    <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground">
                      {Array.from(typingUsers[selectedProject]).join(', ')} {typingUsers[selectedProject].size === 1 ? 'is' : 'are'} typing...
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleAddComment}
                  disabled={!commentContent.trim() || !selectedProject || addCommentMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Project Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress Trend</CardTitle>
                  <CardDescription>Average progress across all projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={currentTeam.projects?.map((p, idx) => ({ 
                      name: p.title?.substring(0, 15) + '...' || `Project ${idx + 1}`, 
                      progress: p.progress || 0 
                    })) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                  <CardDescription>Projects by priority level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(projectStats.byPriority).filter(([_, count]) => count > 0).map(([priority, count]) => ({
                      priority, count, fill: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Create Team Dialog */}
        <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a team to start collaborating on projects.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="team-name" className="text-right">Name</Label>
                <Input 
                  id="team-name" 
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="col-span-3" 
                  placeholder="My Awesome Team"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="team-desc" className="text-right">Description</Label>
                <Textarea 
                  id="team-desc" 
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  className="col-span-3" 
                  placeholder="What's your team about?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => createTeamMutation.mutate({ 
                  name: newTeamName, 
                  description: newTeamDescription 
                })}
                disabled={!newTeamName.trim() || createTeamMutation.isPending}
              >
                {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}