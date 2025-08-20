import React from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  Badge,
  Alert
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'instructor': return 'warning';
      case 'student': return 'primary';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return 'fa-crown';
      case 'instructor': return 'fa-chalkboard-teacher';
      case 'student': return 'fa-user-graduate';
      default: return 'fa-user';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '80px' }}>
      <Container>
        <Row>
          <Col lg={12}>
            {/* Welcome Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h3 mb-1">
                  Welcome back, <span className="text-primary">{user?.loginId}</span>!
                </h1>
                <p className="text-muted mb-0">
                  Here's what's happening in your EngineerSmith dashboard
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <Badge 
                  color={getRoleColor(user?.role || '')} 
                  className="px-3 py-2 fs-6"
                >
                  <i className={`fas ${getRoleIcon(user?.role || '')} me-2`}></i>
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                </Badge>
                <Button color="outline-secondary" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </Button>
              </div>
            </div>

            {/* User Info Alert */}
            <Alert color="info" className="mb-4">
              <div className="d-flex align-items-center">
                <i className="fas fa-info-circle me-3" style={{ fontSize: '1.2rem' }}></i>
                <div>
                  <strong>Account Type:</strong> {user?.isSSO ? 'SSO Authentication' : 'Manual Authentication'} • 
                  <strong className="ms-2">Organization ID:</strong> {user?.organizationId || 'Unknown'} •
                  <strong className="ms-2">Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </Alert>

            {/* Quick Actions Grid */}
            <Row className="g-4">
              {/* Tests Card */}
              <Col md={6} lg={4}>
                <Card className="h-100 shadow-sm border-0">
                  <CardBody className="text-center">
                    <div 
                      className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        width: '60px',
                        height: '60px'
                      }}
                    >
                      <i className="fas fa-clipboard-list text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <CardTitle tag="h5" className="mb-2">Tests</CardTitle>
                    <p className="text-muted small mb-3">
                      {user?.role === 'student' ? 'Take assessments and track your progress' : 'Create and manage tests'}
                    </p>
                    <Button color="primary" outline block>
                      <i className="fas fa-arrow-right me-2"></i>
                      {user?.role === 'student' ? 'Browse Tests' : 'Manage Tests'}
                    </Button>
                  </CardBody>
                </Card>
              </Col>

              {/* Questions Card */}
              {(user?.role === 'admin' || user?.role === 'instructor') && (
                <Col md={6} lg={4}>
                  <Card className="h-100 shadow-sm border-0">
                    <CardBody className="text-center">
                      <div 
                        className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{ 
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          width: '60px',
                          height: '60px'
                        }}
                      >
                        <i className="fas fa-question-circle text-white" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <CardTitle tag="h5" className="mb-2">Questions</CardTitle>
                      <p className="text-muted small mb-3">
                        Create and manage question banks
                      </p>
                      <Button color="primary" outline block>
                        <i className="fas fa-arrow-right me-2"></i>
                        Manage Questions
                      </Button>
                    </CardBody>
                  </Card>
                </Col>
              )}

              {/* Results Card */}
              <Col md={6} lg={4}>
                <Card className="h-100 shadow-sm border-0">
                  <CardBody className="text-center">
                    <div 
                      className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        width: '60px',
                        height: '60px'
                      }}
                    >
                      <i className="fas fa-chart-bar text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <CardTitle tag="h5" className="mb-2">Results</CardTitle>
                    <p className="text-muted small mb-3">
                      {user?.role === 'student' ? 'View your test results and progress' : 'Analytics and reporting'}
                    </p>
                    <Button color="primary" outline block>
                      <i className="fas fa-arrow-right me-2"></i>
                      {user?.role === 'student' ? 'My Results' : 'View Analytics'}
                    </Button>
                  </CardBody>
                </Card>
              </Col>

              {/* Organization Management (Admin only) */}
              {user?.role === 'admin' && (
                <Col md={6} lg={4}>
                  <Card className="h-100 shadow-sm border-0">
                    <CardBody className="text-center">
                      <div 
                        className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{ 
                          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                          width: '60px',
                          height: '60px'
                        }}
                      >
                        <i className="fas fa-users text-white" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <CardTitle tag="h5" className="mb-2">Users</CardTitle>
                      <p className="text-muted small mb-3">
                        Manage organization users and permissions
                      </p>
                      <Button color="primary" outline block>
                        <i className="fas fa-arrow-right me-2"></i>
                        Manage Users
                      </Button>
                    </CardBody>
                  </Card>
                </Col>
              )}

              {/* Profile Card */}
              <Col md={6} lg={4}>
                <Card className="h-100 shadow-sm border-0">
                  <CardBody className="text-center">
                    <div 
                      className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                        width: '60px',
                        height: '60px'
                      }}
                    >
                      <i className="fas fa-user-cog text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <CardTitle tag="h5" className="mb-2">Profile</CardTitle>
                    <p className="text-muted small mb-3">
                      Update your account settings and preferences
                    </p>
                    <Button color="primary" outline block>
                      <i className="fas fa-arrow-right me-2"></i>
                      Edit Profile
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Recent Activity Section */}
            <Row className="mt-5">
              <Col lg={12}>
                <Card className="shadow-sm border-0">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Recent Activity</h5>
                      <Button color="outline-primary" size="sm">
                        View All
                      </Button>
                    </div>
                    <div className="text-center py-5">
                      <i className="fas fa-history text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted">No recent activity to display</p>
                      <p className="small text-muted">
                        Your recent test attempts, submissions, and activity will appear here
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;