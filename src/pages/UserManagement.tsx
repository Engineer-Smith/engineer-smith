// src/pages/UserManagement.tsx - Enhanced with dashboard functionality
import {
  Award,
  Building,
  Clock,
  Edit,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Progress,
  Row,
  Spinner,
  Table
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';

import type {
  User,
  UserDashboardFilters,
  UserManagementDashboard
} from '../types';

const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard state
  const [dashboard, setDashboard] = useState<UserManagementDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<UserDashboardFilters>({
    search: '',
    role: undefined,
    orgId: undefined,
    limit: 20,
    skip: 0
  });
  
  // UI state
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});

  const typedUser = user as User | null;
  const isSuperOrgAdmin = typedUser?.organization?.isSuperOrg && typedUser?.role === 'admin';

  // Fetch dashboard data
  const fetchDashboard = async (showRefreshSpinner = false) => {
    if (!typedUser) return;

    try {
      if (showRefreshSpinner) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const queryParams: Record<string, string> = {};
      if (filters.search) queryParams.search = filters.search;
      if (filters.role) queryParams.role = filters.role;
      if (filters.orgId) queryParams.orgId = filters.orgId;
      if (filters.limit) queryParams.limit = filters.limit.toString();
      if (filters.skip) queryParams.skip = filters.skip.toString();

      const dashboardData = await apiService.getUserDashboard(queryParams);
      setDashboard(dashboardData);

    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (typedUser) {
      fetchDashboard();
    }
  }, [typedUser, filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof UserDashboardFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      skip: key !== 'skip' ? 0 : value // Reset pagination when other filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (newSkip: number) => {
    setFilters(prev => ({ ...prev, skip: newSkip }));
  };

  // Handle user actions
  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleEditUser = (userId: string) => {
    navigate(`/admin/users/${userId}/edit`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiService.deleteUser(userId);
      await fetchDashboard(true);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const toggleDropdown = (userId: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'instructor': return 'warning';
      case 'student': return 'primary';
      default: return 'secondary';
    }
  };

  // Format time duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!typedUser) {
    return <div>Please log in to access this page.</div>;
  }

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">Loading dashboard...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert color="danger">
              <h5>Error Loading Dashboard</h5>
              <p className="mb-3">{error}</p>
              <Button color="primary" onClick={() => fetchDashboard()}>
                <RefreshCw size={16} className="me-1" />
                Retry
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!dashboard) {
    return <div>No dashboard data available</div>;
  }

  const { overview, recentActivity, users, content, organizations } = dashboard;

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 mb-1">
                <Users className="me-2" size={28} />
                User Management
              </h2>
              <p className="text-muted mb-0">
                {isSuperOrgAdmin 
                  ? 'Manage all users across the platform'
                  : `Manage users in your ${typedUser.organization?.name} organization`
                }
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                color="outline-secondary" 
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
              >
                <RefreshCw size={16} className={`me-1 ${refreshing ? 'spinning' : ''}`} />
                Refresh
              </Button>
              <Button 
                color="primary" 
                onClick={() => navigate('/admin/users/new')}
                className="d-flex align-items-center"
              >
                <Plus size={16} className="me-1" />
                Add User
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                  <Users className="text-primary" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{overview.totalUsers.toLocaleString()}</h5>
                  <small className="text-muted">Total Users</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                  <TrendingUp className="text-success" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{recentActivity.registrationTrend}</h5>
                  <small className="text-muted">New This Month</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                  <Award className="text-warning" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">
                    {overview.performance ? `${overview.performance.averageScore.toFixed(1)}%` : 'N/A'}
                  </h5>
                  <small className="text-muted">Avg Score</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                  <Clock className="text-info" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">
                    {overview.performance ? formatDuration(overview.performance.totalTimeSpent) : 'N/A'}
                  </h5>
                  <small className="text-muted">Total Time</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Role Distribution */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white border-bottom-0">
              <h6 className="mb-0">User Distribution</h6>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={4}>
                  <div className="text-center">
                    <div className="mb-2">
                      <Badge color="danger" className="fs-6 px-3 py-2">
                        {overview.roleDistribution.admin}
                      </Badge>
                    </div>
                    <small className="text-muted">Admins</small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <div className="mb-2">
                      <Badge color="warning" className="fs-6 px-3 py-2">
                        {overview.roleDistribution.instructor}
                      </Badge>
                    </div>
                    <small className="text-muted">Instructors</small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <div className="mb-2">
                      <Badge color="primary" className="fs-6 px-3 py-2">
                        {overview.roleDistribution.student}
                      </Badge>
                    </div>
                    <small className="text-muted">Students</small>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white border-bottom-0">
              <h6 className="mb-0">Account Types</h6>
            </CardHeader>
            <CardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">SSO Users</small>
                  <small className="fw-semibold">{overview.accountTypes.sso}</small>
                </div>
                <Progress 
                  value={(overview.accountTypes.sso / overview.totalUsers) * 100} 
                  color="info"
                  className="progress-sm"
                />
              </div>
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Regular Users</small>
                  <small className="fw-semibold">{overview.accountTypes.regular}</small>
                </div>
                <Progress 
                  value={(overview.accountTypes.regular / overview.totalUsers) * 100} 
                  color="success"
                  className="progress-sm"
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Content Creators */}
      {(content.topQuestionCreators.length > 0 || content.topTestCreators.length > 0) && (
        <Row className="mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-white border-bottom-0">
                <h6 className="mb-0">Top Question Creators</h6>
              </CardHeader>
              <CardBody>
                {content.topQuestionCreators.length === 0 ? (
                  <p className="text-muted text-center mb-0">No question creators yet</p>
                ) : (
                  <div className="space-y-3">
                    {content.topQuestionCreators.slice(0, 5).map((creator, index) => (
                      <div key={creator.creatorId} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Badge color="light" className="me-2">{index + 1}</Badge>
                          <div>
                            <small className="fw-semibold">{creator.creatorName}</small>
                            <br />
                            <small className="text-muted">{creator.creatorRole}</small>
                          </div>
                        </div>
                        <Badge color="primary">{creator.questionCount}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-white border-bottom-0">
                <h6 className="mb-0">Top Test Creators</h6>
              </CardHeader>
              <CardBody>
                {content.topTestCreators.length === 0 ? (
                  <p className="text-muted text-center mb-0">No test creators yet</p>
                ) : (
                  <div className="space-y-3">
                    {content.topTestCreators.slice(0, 5).map((creator, index) => (
                      <div key={creator.creatorId} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Badge color="light" className="me-2">{index + 1}</Badge>
                          <div>
                            <small className="fw-semibold">{creator.creatorName}</small>
                            <br />
                            <small className="text-muted">{creator.creatorRole}</small>
                          </div>
                        </div>
                        <Badge color="success">{creator.testCount}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Organizations (Super Admin Only) */}
      {isSuperOrgAdmin && organizations && organizations.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-white border-bottom-0">
                <h6 className="mb-0">Organizations Overview</h6>
              </CardHeader>
              <CardBody>
                <Row>
                  {organizations.slice(0, 4).map((org) => (
                    <Col md={3} key={org._id}>
                      <div className="text-center p-3 border rounded">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <Building size={20} className="me-2" />
                          <h6 className="mb-0">{org.name}</h6>
                          {org.isSuperOrg && <Badge color="warning" className="ms-2">Super</Badge>}
                        </div>
                        <div className="small text-muted">
                          <div>{org.userCount} users</div>
                          <div>{org.adminCount} admins, {org.instructorCount} instructors</div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <CardBody>
          <Row className="g-3">
            <Col md={4}>
              <div className="position-relative">
                <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="ps-4"
                />
              </div>
            </Col>
            <Col md={2}>
              <Input
                type="select"
                value={filters.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
                <option value="admin">Admins</option>
              </Input>
            </Col>
            {isSuperOrgAdmin && organizations && (
              <Col md={3}>
                <Input
                  type="select"
                  value={filters.orgId || ''}
                  onChange={(e) => handleFilterChange('orgId', e.target.value || undefined)}
                >
                  <option value="">All Organizations</option>
                  {organizations.map(org => (
                    <option key={org._id} value={org._id}>{org.name}</option>
                  ))}
                </Input>
              </Col>
            )}
            <Col md={2}>
              <Input
                type="select"
                value={filters.limit || 20}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </Input>
            </Col>
            <Col md={1}>
              <Button 
                color="outline-secondary" 
                onClick={() => setFilters({ search: '', role: undefined, orgId: undefined, limit: 20, skip: 0 })}
                className="w-100"
                title="Clear filters"
              >
                <Filter size={16} />
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-0">
          {users.list.length === 0 ? (
            <div className="text-center py-5">
              <Users size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No users found</h5>
              <p className="text-muted mb-0">
                {filters.search || filters.role || filters.orgId
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first user'
                }
              </p>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    {isSuperOrgAdmin && <th>Organization</th>}
                    <th>Account Type</th>
                    <th>Created</th>
                    <th style={{ width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.list.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div>
                          <div className="fw-semibold">{user.fullName}</div>
                          <small className="text-muted">{user.email || user.loginId}</small>
                        </div>
                      </td>
                      <td>
                        <Badge color={getRoleBadgeColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      {isSuperOrgAdmin && (
                        <td>
                          <div className="d-flex align-items-center">
                            <Building size={14} className="me-1 text-muted" />
                            <small>{user.organizationName}</small>
                          </div>
                        </td>
                      )}
                      <td>
                        <Badge color={user.isSSO ? 'info' : 'secondary'}>
                          {user.isSSO ? 'SSO' : 'Regular'}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <Dropdown 
                          isOpen={dropdownOpen[user._id] || false} 
                          toggle={() => toggleDropdown(user._id)}
                        >
                          <DropdownToggle
                            tag="button"
                            className="btn btn-sm btn-outline-secondary"
                          >
                            <MoreVertical size={14} />
                          </DropdownToggle>
                          <DropdownMenu end>
                            <DropdownItem onClick={() => handleViewUser(user._id)}>
                              <Eye size={14} className="me-2" />
                              View Details
                            </DropdownItem>
                            <DropdownItem onClick={() => handleEditUser(user._id)}>
                              <Edit size={14} className="me-2" />
                              Edit User
                            </DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem 
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-danger"
                            >
                              <Trash2 size={14} className="me-2" />
                              Delete User
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {/* Pagination */}
              {users.pagination.hasMore && (
                <div className="p-3 border-top bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Showing {users.pagination.skip + 1} to {Math.min(users.pagination.skip + users.pagination.limit, users.pagination.total)} of {users.pagination.total} users
                    </small>
                    <div>
                      <Button
                        size="sm"
                        color="outline-secondary"
                        disabled={users.pagination.skip === 0}
                        onClick={() => handlePageChange(Math.max(0, users.pagination.skip - users.pagination.limit))}
                        className="me-2"
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        color="outline-secondary"
                        disabled={!users.pagination.hasMore}
                        onClick={() => handlePageChange(users.pagination.skip + users.pagination.limit)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default UserManagementPage;