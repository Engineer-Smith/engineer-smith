import React from "react";
import { Navbar, Nav, NavItem, NavLink, Button } from "reactstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AppNavbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  return (
    <Navbar color="dark" dark expand="md" className="mb-4">
      <Nav navbar className="container-fluid">
        <NavItem>
          <NavLink tag={Link} to="/" className="text-white">
            Home
          </NavLink>
        </NavItem>
        {user?.role === "admin" && (
          <NavItem>
            <NavLink tag={Link} to="/admin" className="text-white">
              Admin Dashboard
            </NavLink>
          </NavItem>
        )}
        {user ? (
          <NavItem className="ml-auto">
            <Button color="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </NavItem>
        ) : (
          <NavItem className="ml-auto">
            <NavLink tag={Link} to="/login" className="text-white">
              <Button color="outline-light" size="sm">
                Login
              </Button>
            </NavLink>
          </NavItem>
        )}
      </Nav>
    </Navbar>
  );
};

export default AppNavbar;