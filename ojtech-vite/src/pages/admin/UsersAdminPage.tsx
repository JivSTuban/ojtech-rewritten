import React, { Component } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table";
import { Skeleton } from "../../components/ui/Skeleton";
import { UserCheck, UserX, Search, Briefcase, UserCircle } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import adminService from "../../lib/api/adminService";

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  enabled: boolean;
  createdAt?: string;
}

interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

interface UsersAdminPageState {
  users: User[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filterRole: string;
  pageSize: number;
}

export class UsersAdminPage extends Component<{}, UsersAdminPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  constructor(props: {}) {
    super(props);
    this.state = {
      users: [],
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
      loading: true,
      error: null,
      searchQuery: "",
      filterRole: "all",
      pageSize: 10
    };
  }
  
  componentDidMount() {
    this.fetchUsers();
  }
  
  async fetchUsers() {
    try {
      const { currentPage, pageSize, searchQuery } = this.state;
      let response: PaginatedResponse<User>;
      
      if (searchQuery) {
        response = await adminService.searchUsers(searchQuery, currentPage, pageSize);
      } else {
        response = await adminService.getPaginatedUsers(currentPage, pageSize);
      }
      
      this.setState({
        users: response.content,
        currentPage: response.currentPage,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        loading: false,
      });
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
      await adminService.toggleUserStatus(userId);
      await this.fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error activating user:", error);
    }
  }
  
  handleDeactivateUser = async (userId: string) => {
    try {
      await adminService.toggleUserStatus(userId);
      await this.fetchUsers(); // Refresh the list
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
  
  handlePageChange = (newPage: number) => {
    this.setState({ currentPage: newPage }, () => {
      this.fetchUsers();
    });
  }
  handleUserDelete = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
      await this.fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  getFilteredUsers = () => {
    const { users, filterRole } = this.state;
    
    if (filterRole === 'all') {
      return users;
    }
    
    return users.filter(user => 
      user.roles.includes(filterRole)
    );
  }
  
  render() {
    const { user } = this.context || {};
    const { loading, error, searchQuery, filterRole } = this.state;
    
    // Redirect if not logged in or not admin
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (!user.roles?.includes('ROLE_ADMIN')) {
      return <Navigate to="/" />;
    }
    
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
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {this.getRoleIcon(user.roles[0])}
                              <span className="ml-2">
                                {user.roles.map((role: string) => 
                                  role.replace('ROLE_', '')
                                ).join(', ')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.enabled ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.enabled ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            {user.enabled ? (
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => this.handleUserDelete(user.id)}
                              className="ml-2"
                              title="Delete User"
                            >
                              Delete
                            </Button>
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
