import React, { Component } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Users, Briefcase, FilePlus2, LineChart, UserPlus, Search, X } from "lucide-react";
import { Skeleton } from "../../components/ui/Skeleton";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import adminService from "../../lib/api/adminService";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
}

class StatsCard extends Component<StatsCardProps> {
  render() {
    const { title, value, icon, loading } = this.props;
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-9 w-16 mt-1" />
              ) : (
                <p className="text-3xl font-bold">{value}</p>
              )}
            </div>
            <div className="text-muted-foreground">{icon}</div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

interface RecentActivity {
  userId: string;
  username: string;
  email: string;
  role: string;
  activityType: string;
  timestamp: string;
}

interface DashboardStats {
  totalUsers: number;
  userDistribution: {
    admin: number;
    employer: number;
    student: number;
  };
  totalApplications: number;
  loading: boolean;
  recentActivities: RecentActivity[];
  activitiesLoading: boolean;
  searchQuery: string;
  selectedRole: string;
  selectedActivityType: string;
}

export class AdminDashboardPage extends Component<{}, DashboardStats> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  constructor(props: {}) {
    super(props);
    this.state = {
      totalUsers: 0,
      userDistribution: {
        admin: 0,
        employer: 0,
        student: 0
      },
      totalApplications: 0,
      loading: true,
      recentActivities: [],
      activitiesLoading: true,
      searchQuery: '',
      selectedRole: '',
      selectedActivityType: '',
    };
  }
  
  componentDidMount() {
    this.fetchStats();
    this.fetchRecentActivity();
  }
  
  async fetchStats() {
    try {
      const detailedStats = await adminService.getDetailedStats();
      
      this.setState({
        totalUsers: detailedStats.totalUsers,
        userDistribution: detailedStats.userDistribution,
        totalApplications: detailedStats.totalApplications,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      this.setState({ loading: false });
    }
  }
  
  async fetchRecentActivity() {
    try {
      const activities = await adminService.getRecentActivity(10);
      this.setState({
        recentActivities: activities,
        activitiesLoading: false,
      });
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      this.setState({ activitiesLoading: false });
    }
  }
  
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }
  
  getRoleBadgeColor(): string {
    return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  }
  
  getFilteredActivities(): RecentActivity[] {
    const { recentActivities, searchQuery, selectedRole, selectedActivityType } = this.state;
    
    return recentActivities.filter(activity => {
      const matchesSearch = searchQuery === '' || 
        activity.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = selectedRole === '' || activity.role === selectedRole;
      const matchesActivityType = selectedActivityType === '' || activity.activityType === selectedActivityType;
      
      return matchesSearch && matchesRole && matchesActivityType;
    });
  }
  
  getUniqueRoles(): string[] {
    const roles = new Set(this.state.recentActivities.map(a => a.role));
    return Array.from(roles).sort();
  }
  
  getUniqueActivityTypes(): string[] {
    const types = new Set(this.state.recentActivities.map(a => a.activityType));
    return Array.from(types).sort();
  }
  
  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchQuery: e.target.value });
  }
  
  handleRoleFilter = (role: string) => {
    this.setState({ selectedRole: role });
  }
  
  handleActivityTypeFilter = (type: string) => {
    this.setState({ selectedActivityType: type });
  }
  
  clearFilters = () => {
    this.setState({
      searchQuery: '',
      selectedRole: '',
      selectedActivityType: '',
    });
  }
  
  render() {
    const { user } = this.context || {};
    
    // Redirect if not logged in or not admin
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (!user.roles?.includes('ROLE_ADMIN')) {
      return <Navigate to="/" />;
    }
    
    const { totalUsers, userDistribution, totalApplications, loading, activitiesLoading, searchQuery, selectedRole, selectedActivityType } = this.state;
    const filteredActivities = this.getFilteredActivities();
    const hasActiveFilters = searchQuery !== '' || selectedRole !== '' || selectedActivityType !== '';
    
    return (
      <div className="container mx-auto py-6 space-y-6 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor platform activity and manage key metrics.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Users" 
            value={totalUsers} 
            icon={<Users className="h-6 w-6" />} 
            loading={loading} 
          />
          <StatsCard 
            title="Students" 
            value={userDistribution.student} 
            icon={<Users className="h-6 w-6" />} 
            loading={loading} 
          />
          <StatsCard 
            title="Employers" 
            value={userDistribution.employer} 
            icon={<Briefcase className="h-6 w-6" />} 
            loading={loading} 
          />
          <StatsCard 
            title="Applications" 
            value={totalApplications} 
            icon={<FilePlus2 className="h-6 w-6" />} 
            loading={loading} 
          />
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between font-medium">
              <span>Recent Activity</span>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={this.handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              
              {/* Filter Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Role Filter */}
                <select
                  value={selectedRole}
                  onChange={(e) => this.handleRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">All Roles</option>
                  {this.getUniqueRoles().map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                
                {/* Activity Type Filter */}
                <select
                  value={selectedActivityType}
                  onChange={(e) => this.handleActivityTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">All Activity Types</option>
                  {this.getUniqueActivityTypes().map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              
              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={this.clearFilters}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
            
            {/* Activities List */}
            <div className="grid gap-2">
              {activitiesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredActivities.length > 0 ? (
                <div className="space-y-2">
                  {filteredActivities.map((activity) => (
                  <div 
                    key={activity.userId} 
                    className="flex items-start justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <UserPlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{activity.username}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${this.getRoleBadgeColor()}`}>
                            {activity.role}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{activity.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.activityType.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {this.formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <LineChart className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="font-medium">{hasActiveFilters ? 'No matching activity' : 'No recent activity'}</p>
                  <p className="text-sm text-muted-foreground">{hasActiveFilters ? 'Try adjusting your filters.' : 'New user registrations will appear here.'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
