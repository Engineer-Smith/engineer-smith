// src/components/navbar/UserMenu.tsx
import React from 'react';
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

interface User {
  _id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  loginId?: string;
  role?: string;
  organization?: {
    name?: string;
    isSuperOrg?: boolean;
  };
}

interface UserMenuProps {
  user: User | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onNavigate, onLogout }) => {
  const getUserDisplayName = () => {
    if (user?.fullName) {
      return user.fullName;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.loginId || 'User';
  };

  const hasUserName = () => {
    return user?.fullName || (user?.firstName && user?.lastName);
  };

  return (
    <UncontrolledDropdown nav inNavbar>
      <DropdownToggle nav caret className="d-flex align-items-center">
        <div className="me-2 text-end">
          <div className="fw-medium" style={{ lineHeight: '1.1' }}>
            {getUserDisplayName()}
          </div>
          {hasUserName() && (
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
              @{user?.loginId}
            </small>
          )}
        </div>
        <div className="d-flex align-items-center">
          <span 
            className="badge text-uppercase me-1" 
            style={{ 
              fontSize: '0.7rem',
              backgroundColor: user?.role === 'admin' ? '#dc3545' : 
                              user?.role === 'instructor' ? '#fd7e14' : '#28a745',
              color: 'white'
            }}
          >
            {user?.role}
          </span>
          {user?.organization?.isSuperOrg && (
            <span className="badge bg-primary" style={{ fontSize: '0.6rem' }}>
              SUPER
            </span>
          )}
        </div>
      </DropdownToggle>
      <DropdownMenu end>
        <div className="dropdown-header">
          <div className="fw-medium">{getUserDisplayName()}</div>
          <small className="text-muted">@{user?.loginId}</small>
          <div className="mt-1">
            <small className="text-muted">
              ID: {user?._id?.slice(0, 8)}...
            </small>
            <br />
            <small className="text-muted">
              Org: {user?.organization?.name}
            </small>
          </div>
        </div>
        <DropdownItem divider />
        <DropdownItem onClick={() => onNavigate('/profile')}>
          <i className="fas fa-user me-2"></i>
          Profile
        </DropdownItem>
        <DropdownItem onClick={() => onNavigate('/settings')}>
          <i className="fas fa-cog me-2"></i>
          Settings
        </DropdownItem>
        
        <DropdownItem divider />
        <DropdownItem onClick={onLogout}>
          <i className="fas fa-sign-out-alt me-2"></i>
          Sign Out
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};




export default UserMenu
