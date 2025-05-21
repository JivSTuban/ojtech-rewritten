import React, { Component } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table";
import { Skeleton } from "../../components/ui/Skeleton";
import { UserCheck, UserX, Search, Briefcase, UserCircle } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import apiClient from "../../lib/api/apiClient";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  dateCreated: string;
  hasCompletedOnboarding: boolean;
}

// Mock data for development
const mockUsers: User[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "ROLE_STUDENT",
    status: "active",
    dateCreated: "2023-01-15T10:30:00Z",
    hasCompletedOnboarding: true
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
    role: "ROLE_EMPLOYER",
    status: "active",
    dateCreated: "2023-02-20T14:45:00Z",
    hasCompletedOnboarding: true
  },
  {
    id: "3",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "ROLE_ADMIN",
    status: "active",
    dateCreated: "2022-12-05T09:15:00Z",
    hasCompletedOnboarding: true
  },
  {
    id: "4",
    email: "robert.johnson@example.com",
    firstName: "Robert",
    lastName: "Johnson",
    role: "ROLE_STUDENT",
    status: "inactive",
    dateCreated: "2023-03-10T16:20:00Z",
    hasCompletedOnboarding: false
  },
  {
    id: "5",
    email: "sarah.williams@example.com",
    firstName: "Sarah",
    lastName: "Williams",
    role: "ROLE_EMPLOYER",
    status: "pending",
    dateCreated: "2023-04-05T11:10:00Z",
    hasCompletedOnboarding: false
  }
];

interface UsersAdminPageState {
  users: User[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filterRole: string;
}

export class UsersAdminPage extends Component<{}, UsersAdminPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  constructor(props: {}) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      error: null,
      searchQuery: "",
      filterRole: "all",
    };
  }
  
  componentDidMount() {
    this.fetchUsers();
  }
  
  async fetchUsers() {
    try {
      // Using mock data instead of API call
      setTimeout(() => {
        this.setState({
          users: mockUsers,
          loading: false,
        });
      }, 500); // Simulate API delay
    } catch (error) {
      console.error("Error fetching users:", error);
      this.setState({ 
        loading: false,
        error: typeof error === 'string' ? error : "Failed to load users" 
      });
    }
  }
  
  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchQuery: e.target.value });
  }
  
  handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ filterRole: e.target.value });
  }
  
  handleActivateUser = async (userId: string) => {
    try {
      // Mock activation instead of API call
      this.setState(prevState => ({
        users: prevState.users.map(user => 
          user.id === userId ? { ...user, status: 'active' } : user
        )
      }));
    } catch (error) {
      console.error("Error activating user:", error);
    }
  }
  
  handleDeactivateUser = async (userId: string) => {
    try {
      // Mock deactivation instead of API call
      this.setState(prevState => ({
        users: prevState.users.map(user => 
          user.id === userId ? { ...user, status: 'inactive' } : user
        )
      }));
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  }
  
  getRoleIcon = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <UserCheck className="h-5 w-5 text-gray-600" />;
      case 'ROLE_EMPLOYER':
        return <Briefcase className="h-5 w-5 text-gray-500" />;
      case 'ROLE_STUDENT':
        return <UserCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <UserCircle className="h-5 w-5 text-gray-300" />;
    }
  }
  
  getFilteredUsers = () => {
    const { users, searchQuery, filterRole } = this.state;
    
    return users.filter(user => {
      const matchesSearch = 
        searchQuery === '' ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = 
        filterRole === 'all' ||
        user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
  }
  
  render() {
    const { user } = this.context || {};
    const { loading, error, searchQuery, filterRole } = this.state;
    
    // Redirect if not logged in or not admin
    // if (!user) {
    //   return <Navigate to="/login" />;
    // }
    
    // if (!user.roles?.includes('ROLE_ADMIN')) {
    //   return <Navigate to="/" />;
    // }
    
    const filteredUsers = this.getFilteredUsers();
    
    return (
      <div className="container mx-auto py-6 space-y-6 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage platform users and control account access.
            </p>
          </div>
          <div>
            <Button onClick={() => this.fetchUsers()}>
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-input bg-background"
              value={searchQuery}
              onChange={this.handleSearchChange}
            />
          </div>
          
          <select
            className="w-full md:w-auto pl-3 pr-8 py-2 text-sm rounded-md border border-input bg-background"
            value={filterRole}
            onChange={this.handleFilterChange}
          >
            <option value="all">All Roles</option>
            <option value="ROLE_STUDENT">Students</option>
            <option value="ROLE_EMPLOYER">Employers</option>
            <option value="ROLE_ADMIN">Admins</option>
          </select>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">
                {error}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Onboarding</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-center py-6 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {this.getRoleIcon(user.role)}
                              <span className="ml-2">
                                {user.role === 'ROLE_ADMIN' ? 'Admin' : 
                                 user.role === 'ROLE_EMPLOYER' ? 'Employer' : 
                                 user.role === 'ROLE_STUDENT' ? 'Student' : user.role}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'active' ? 'bg-gray-200 text-gray-800' :
                              user.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                              'bg-gray-300 text-gray-700'
                            }`}>
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.hasCompletedOnboarding ? (
                              <span className="text-gray-600">Complete</span>
                            ) : (
                              <span className="text-gray-400">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.dateCreated).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {user.status === 'active' ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => this.handleDeactivateUser(user.id)}
                                title="Deactivate User"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => this.handleActivateUser(user.id)}
                                title="Activate User"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Activate
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
} 