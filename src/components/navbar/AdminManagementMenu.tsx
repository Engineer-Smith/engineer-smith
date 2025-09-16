// src/components/navbar/AdminManagementMenu.tsx
import React from 'react';
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

interface AdminManagementMenuProps {
  onNavigate: (path: string) => void;
  isSuperOrgAdmin: boolean;
}

const AdminManagementMenu: React.FC<AdminManagementMenuProps> = ({ 
  onNavigate, 
  isSuperOrgAdmin 
}) => {
  return (
    <UncontrolledDropdown nav inNavbar>
      <DropdownToggle nav caret>
        <i className="fas fa-tools me-2"></i>
        Manage
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={() => onNavigate('/admin/users')}>
          <i className="fas fa-users me-2"></i>
          Users
        </DropdownItem>
        <DropdownItem onClick={() => onNavigate('/admin/question-bank')}>
          <i className="fas fa-question-circle me-2"></i>
          Questions
        </DropdownItem>
        <DropdownItem onClick={() => onNavigate('/admin/tests')}>
          <i className="fas fa-clipboard-list me-2"></i>
          Tests
        </DropdownItem>
        <DropdownItem onClick={() => onNavigate('/admin/test-sessions')}>
          <i className="fas fa-desktop me-2"></i>
          Test Sessions
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={() => onNavigate('/admin/analytics')}>
          <i className="fas fa-chart-bar me-2"></i>
          Analytics
        </DropdownItem>
        
        {/* Super Admin Only Items */}
        {isSuperOrgAdmin && (
          <>
            <DropdownItem divider />
            <DropdownItem header className="text-primary">
              <i className="fas fa-crown me-2"></i>
              Super Admin
            </DropdownItem>
            <DropdownItem onClick={() => onNavigate('/admin/organizations')}>
              <i className="fas fa-building me-2"></i>
              Organizations
            </DropdownItem>
            <DropdownItem onClick={() => onNavigate('/admin/global-content')}>
              <i className="fas fa-globe me-2"></i>
              Global Content
            </DropdownItem>
            <DropdownItem onClick={() => onNavigate('/admin/system-health')}>
              <i className="fas fa-heartbeat me-2"></i>
              System Health
            </DropdownItem>
          </>
        )}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default AdminManagementMenu