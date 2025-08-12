import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Card,
  CardBody,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Badge,
  Row,
  Col,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import type { User } from "../types";

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "student" | "instructor" | "admin";
}

const UserManagementPage: React.FC = () => {
  const { client } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form data
  const [createData, setCreateData] = useState<CreateUserData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student"
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Updated to use correct endpoint /admin/users
      const response = await client.get(`/admin/users?page=${page}&limit=${pagination.limit}`);
      
      // ✅ Handle standardized response format
      if (response.data.success) {
        // New format: { success: true, data: [...], pagination: {...} }
        setUsers(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      } else if (Array.isArray(response.data.users)) {
        // Fallback for old format: { users: [...], pagination: {...} }
        setUsers(response.data.users);
        setPagination(response.data.pagination || pagination);
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array
        setUsers(response.data);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          "Failed to fetch users";
      setError(errorMessage);
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!createData.email || !createData.password || !createData.firstName || !createData.lastName) {
      setError("All fields are required");
      return;
    }

    if (createData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      
      // ✅ Updated to use correct endpoint /admin/users
      const response = await client.post("/admin/users", createData);
      
      // ✅ Handle standardized response format
      let newUser = null;
      let successMessage = `${createData.role.charAt(0).toUpperCase() + createData.role.slice(1)} created successfully`;
      
      if (response.data.success) {
        // New format: { success: true, data: { user: {...} }, message: "..." }
        newUser = response.data.data?.user;
        successMessage = response.data.message || successMessage;
      } else if (response.data.user) {
        // Fallback for old format: { user: {...} }
        newUser = response.data.user;
      } else {
        // Fallback for other formats
        newUser = response.data;
      }
      
      if (newUser) {
        setUsers(prev => [newUser, ...prev]);
        setSuccess(successMessage);
        setShowCreateModal(false);
        setCreateData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          role: "student"
        });
        
        // Refresh the list to get updated pagination
        await fetchUsers(pagination.page);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          "Failed to create user";
      setError(errorMessage);
      console.error("Create user error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: "student" | "instructor" | "admin") => {
    try {
      setError(null);
      setSuccess(null);
      
      // ✅ Updated to use correct endpoint /admin/users/:id/role
      const response = await client.put(`/admin/users/${userId}/role`, { role: newRole });
      
      // Update the user in the local state
      setUsers(prev => prev.map(user => 
        user._id === userId  // ✅ Using _id consistently
          ? { ...user, role: newRole }
          : user
      ));
      
      // ✅ Handle standardized response format for success message
      let successMessage = 'User role updated successfully';
      if (response.data.success && response.data.message) {
        successMessage = response.data.message;
      }
      
      setSuccess(successMessage);
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          "Failed to update user role";
      setError(errorMessage);
      console.error("Update user role error:", err);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
    setError(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchUsers(newPage);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "danger";
      case "instructor": return "warning";
      case "student": return "primary";
      default: return "secondary";
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateData(prev => ({ ...prev, [name]: value }));
  };

  if (loading && users.length === 0) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading users...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1 font-weight-bold">User Management</h1>
          {pagination.total > 0 && (
            <p className="text-muted mb-0">
              {pagination.total} user{pagination.total !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
        <Button color="primary" onClick={() => setShowCreateModal(true)}>
          Add New User
        </Button>
      </div>

      {error && (
        <Alert color="danger" className="mb-4" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="success" className="mb-4" dismissible onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No users found</h5>
              <p className="text-muted">Create your first user to get started.</p>
              <Button color="primary" onClick={() => setShowCreateModal(true)}>
                Add New User
              </Button>
            </div>
          ) : (
            <>
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Last Login</th>
                    <th>SSO Provider</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div>
                          <div className="font-weight-bold">
                            {user.profile.firstName} {user.profile.lastName}
                          </div>
                          {user.profile.organization && (
                            <small className="text-muted">{user.profile.organization}</small>
                          )}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <Badge color={getRoleColor(user.role)}>
                          {formatRole(user.role)}
                        </Badge>
                      </td>
                      <td>
                        {user.lastLogin ? (
                          <span>
                            {new Date(user.lastLogin).toLocaleDateString()}
                            <br />
                            <small className="text-muted">
                              {new Date(user.lastLogin).toLocaleTimeString()}
                            </small>
                          </span>
                        ) : (
                          <span className="text-muted">Never</span>
                        )}
                      </td>
                      <td>
                        {user.ssoProvider ? (
                          <Badge color="info">{user.ssoProvider}</Badge>
                        ) : (
                          <span className="text-muted">Local</span>
                        )}
                      </td>
                      <td>
                        <Button
                          color="outline-primary"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit Role
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <div className="text-muted small">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} users
                  </div>
                  
                  <Pagination className="mb-0">
                    <PaginationItem disabled={pagination.page === 1}>
                      <PaginationLink 
                        previous 
                        onClick={() => handlePageChange(pagination.page - 1)}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(pageNum => {
                        return pageNum === 1 || 
                               pageNum === pagination.pages || 
                               Math.abs(pageNum - pagination.page) <= 1;
                      })
                      .map((pageNum, index, array) => {
                        const showEllipsis = index > 0 && array[index - 1] < pageNum - 1;
                        
                        return (
                          <React.Fragment key={pageNum}>
                            {showEllipsis && (
                              <PaginationItem disabled>
                                <PaginationLink>...</PaginationLink>
                              </PaginationItem>
                            )}
                            <PaginationItem active={pageNum === pagination.page}>
                              <PaginationLink onClick={() => handlePageChange(pageNum)}>
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      })}
                    
                    <PaginationItem disabled={pagination.page === pagination.pages}>
                      <PaginationLink 
                        next 
                        onClick={() => handlePageChange(pagination.page + 1)}
                      />
                    </PaginationItem>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} toggle={() => setShowCreateModal(false)} size="lg">
        <ModalHeader toggle={() => setShowCreateModal(false)}>
          Create New User
        </ModalHeader>
        <Form onSubmit={handleCreateUser}>
          <ModalBody>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="firstName">First Name</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={createData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="lastName">Last Name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={createData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label for="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={createData.email}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label for="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={createData.password}
                onChange={handleInputChange}
                minLength={8}
                required
              />
              <small className="text-muted">Minimum 8 characters</small>
            </FormGroup>

            <FormGroup>
              <Label for="role">Role</Label>
              <Input
                type="select"
                id="role"
                name="role"
                value={createData.role}
                onChange={handleInputChange}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Administrator</option>
              </Input>
              <small className="text-muted">
                Students can take tests, Instructors can create questions, Admins have full access
              </small>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" color="primary" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
            <Button color="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Edit User Role Modal */}
      <Modal isOpen={showEditModal} toggle={() => setShowEditModal(false)}>
        <ModalHeader toggle={() => setShowEditModal(false)}>
          Edit User Role
        </ModalHeader>
        <ModalBody>
          {selectedUser && (
            <>
              <div className="mb-3">
                <strong>User:</strong> {selectedUser.profile.firstName} {selectedUser.profile.lastName}
                <br />
                <small className="text-muted">{selectedUser.email}</small>
              </div>
              
              <div className="mb-3">
                <strong>Current Role:</strong>{" "}
                <Badge color={getRoleColor(selectedUser.role)}>
                  {formatRole(selectedUser.role)}
                </Badge>
              </div>

              <FormGroup>
                <Label>Change Role To:</Label>
                <div className="d-grid gap-2">
                  <Button
                    color={selectedUser.role === "student" ? "primary" : "outline-primary"}
                    onClick={() => handleUpdateUserRole(selectedUser._id, "student")}
                    disabled={selectedUser.role === "student"}
                  >
                    Student
                  </Button>
                  <Button
                    color={selectedUser.role === "instructor" ? "warning" : "outline-warning"}
                    onClick={() => handleUpdateUserRole(selectedUser._id, "instructor")}
                    disabled={selectedUser.role === "instructor"}
                  >
                    Instructor
                  </Button>
                  <Button
                    color={selectedUser.role === "admin" ? "danger" : "outline-danger"}
                    onClick={() => handleUpdateUserRole(selectedUser._id, "admin")}
                    disabled={selectedUser.role === "admin"}
                  >
                    Administrator
                  </Button>
                </div>
              </FormGroup>

              <Alert color="info" className="mt-3">
                <small>
                  <strong>Note:</strong> Role changes take effect immediately. 
                  The user may need to log out and back in to see all new permissions.
                </small>
              </Alert>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default UserManagementPage;