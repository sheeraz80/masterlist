'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Activity,
  Users,
  FileText,
  TrendingUp,
  LogIn
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ProfileData {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: string;
    createdAt: string;
    bio?: string;
  };
  stats: {
    totalProjects: number;
    totalComments: number;
    totalActivities: number;
    teamsJoined: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

async function fetchProfile() {
  const response = await fetch('/api/profile');
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

async function updateProfile(data: { name: string; bio?: string }) {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  
  const { data: profileData, isLoading } = useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: !!user
  });
  
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);
  
  useEffect(() => {
    if (profileData?.user) {
      setEditedName(profileData.user.name);
      setEditedBio(profileData.user.bio || '');
    }
  }, [profileData]);
  
  if (authLoading || isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="space-y-8">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!user || !profileData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Please log in to view your profile</p>
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
  
  const { user: userData, stats, recentActivity } = profileData;
  
  const handleSave = () => {
    updateMutation.mutate({
      name: editedName.trim(),
      bio: editedBio.trim()
    });
  };
  
  const handleCancel = () => {
    setEditedName(userData.name);
    setEditedBio(userData.bio || '');
    setIsEditing(false);
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User Profile</CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={updateMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline"
                    disabled={updateMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userData.avatar} />
                <AvatarFallback className="text-2xl">
                  {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                {!isEditing ? (
                  <>
                    <div>
                      <h2 className="text-2xl font-semibold">{userData.name}</h2>
                      <p className="text-muted-foreground">{userData.email}</p>
                    </div>
                    
                    {userData.bio && (
                      <p className="text-sm">{userData.bio}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant={userData.role === 'admin' ? 'default' : 'secondary'}>
                        <Shield className="mr-1 h-3 w-3" />
                        {userData.role}
                      </Badge>
                      <span className="text-muted-foreground">
                        <Calendar className="inline-block mr-1 h-3 w-3" />
                        Joined {formatDistanceToNow(new Date(userData.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editedBio}
                        onChange={(e) => setEditedBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{stats.totalProjects}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">{stats.totalComments}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold">{stats.totalActivities}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Teams Joined
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">{stats.teamsJoined}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Activity & Settings Tabs */}
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions and contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Email notification settings will be available soon.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Security</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage your password and security settings.
                    </p>
                    <Button variant="outline" disabled>
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                    <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                      Danger Zone
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back.
                    </p>
                    <Button variant="destructive" disabled>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}