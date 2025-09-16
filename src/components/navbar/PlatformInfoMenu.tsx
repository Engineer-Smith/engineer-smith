// src/components/navbar/PlatformInfoMenu.tsx
import React from 'react';
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

interface PlatformInfoMenuProps {
  onNavigate: (path: string) => void;
}

const PlatformInfoMenu: React.FC<PlatformInfoMenuProps> = ({ onNavigate }) => {
  return (
    <UncontrolledDropdown nav inNavbar>
      <DropdownToggle nav caret className="text-muted">
        <i className="fas fa-info-circle me-2"></i>
        Platform
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={() => onNavigate('/features')}>
          <i className="fas fa-cogs me-2"></i>
          Features
        </DropdownItem>
        <DropdownItem onClick={() => onNavigate('/languages')}>
          <i className="fas fa-code me-2"></i>
          Languages
        </DropdownItem>
        <DropdownItem onClick={() => onNavigate('/for-organizations')}>
          <i className="fas fa-building me-2"></i>
          Organizations
        </DropdownItem>
        <DropdownItem onClick={() => onNavigate('/for-individuals')}>
          <i className="fas fa-user me-2"></i>
          Individuals
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={() => onNavigate('/')}>
          <i className="fas fa-home me-2"></i>
          Landing Page
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default PlatformInfoMenu