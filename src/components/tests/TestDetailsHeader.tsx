// src/components/tests/TestDetailsHeader.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Badge,
  Button,
  ButtonGroup,
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip
} from 'reactstrap';
import { useAuth } from '../../context/AuthContext';
import type { Test } from '../../types';

interface TestDetailsHeaderProps {
  test: Test;
  onTestUpdate: (test: Test) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TestDetailsHeader: React.FC<TestDetailsHeaderProps> = ({
  test,
  onTestUpdate,
  activeTab,
  onTabChange
}) => {
  const { client } = useAuth();
  const navigate = useNavigate();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'secondary';
      default: return 'light';
    }
  };

  const getTestTypeDisplay = (testType: string) => {
    const types: { [key: string]: string } = {
      'single_skill': 'Single Skill',
      'frontend': 'Frontend',
      'react_focused': 'React Focused',
      'full_stack': 'Full Stack',
      'mobile': 'Mobile',
      'comprehensive': 'Comprehensive',
      'custom': 'Custom'
    };
    return types[testType] || testType;
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      const response = await client.put(`/tests/${test._id}`, {
        status: newStatus
      });
      onTestUpdate(response.data.test);
    } catch (error: any) {
      console.error('Failed to update test status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setLoading(true);
      const response = await client.post(`/tests/${test._id}/duplicate`);
      navigate(`/admin/tests/${response.data.test._id}`);
    } catch (error: any) {
      console.error('Failed to duplicate test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/test-preview/${test._id}`, '_blank');
  };

  const canEdit = test.status === 'draft' || (test.stats?.totalAttempts || 0) === 0;
  const canPublish = test.status === 'draft';
  const canArchive = test.status === 'published';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'questions', label: 'Questions', icon: '❓' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="border-bottom pb-3 mb-4">
      {/* Main Header */}
      <Row className="align-items-start mb-3">
        <Col>
          <div className="d-flex align-items-center mb-2">
            <Button
              color="link"
              className="p-0 me-2"
              onClick={() => navigate('/admin/tests')}
            >
              ← Back to Tests
            </Button>
          </div>
          
          <h1 className="h2 mb-2 d-flex align-items-center">
            {test.title}
            <Badge 
              color={getStatusColor(test.status)} 
              className="ms-3"
              pill
            >
              {test.status}
            </Badge>
          </h1>
          
          <div className="text-muted mb-2">
            <small>
              {getTestTypeDisplay(test.testType)} • 
              {test.settings.useSections ? (
                <span> {test.sections?.length || 0} sections • </span>
              ) : (
                <span> {test.questions?.length || 0} questions • </span>
              )}
              {test.totalTime} minutes • 
              Created {new Date(test.createdAt).toLocaleDateString()}
            </small>
          </div>
          
          {test.description && (
            <p className="text-muted mb-3">{test.description}</p>
          )}
          
          {/* Skills */}
          {test.skills && test.skills.length > 0 && (
            <div className="mb-3">
              {test.skills.map((skill, index) => (
                <Badge key={index} color="primary" className="me-2" pill>
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </Col>
        
        <Col xs="auto">
          <ButtonGroup>
            {canEdit && (
              <Button
                color="outline-primary"
                onClick={() => navigate(`/admin/tests/${test._id}/edit`)}
                disabled={loading}
              >
                Edit Test
              </Button>
            )}
            
            <Button
              color="outline-info"
              onClick={handlePreview}
              id="preview-btn"
            >
              Preview
            </Button>
            <UncontrolledTooltip target="preview-btn">
              Open test preview in new tab
            </UncontrolledTooltip>
            
            <Dropdown 
              isOpen={actionsOpen} 
              toggle={() => setActionsOpen(!actionsOpen)}
            >
              <DropdownToggle caret color="outline-secondary">
                Actions
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem onClick={handleDuplicate} disabled={loading}>
                  📋 Duplicate Test
                </DropdownItem>
                
                <DropdownItem divider />
                
                {canPublish && (
                  <DropdownItem 
                    onClick={() => handleStatusChange('published')}
                    disabled={loading}
                  >
                    🚀 Publish Test
                  </DropdownItem>
                )}
                
                {canArchive && (
                  <DropdownItem 
                    onClick={() => handleStatusChange('archived')}
                    disabled={loading}
                  >
                    📦 Archive Test
                  </DropdownItem>
                )}
                
                {test.status === 'archived' && (
                  <DropdownItem 
                    onClick={() => handleStatusChange('published')}
                    disabled={loading}
                  >
                    🔄 Republish Test
                  </DropdownItem>
                )}
                
                <DropdownItem divider />
                
                <DropdownItem 
                  onClick={() => navigate(`/admin/tests/${test._id}/results`)}
                >
                  📊 View All Results
                </DropdownItem>
                
                <DropdownItem 
                  onClick={() => navigate(`/admin/tests/${test._id}/export`)}
                >
                  💾 Export Data
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </ButtonGroup>
        </Col>
      </Row>
      
      {/* Navigation Tabs */}
      <Nav tabs>
        {tabs.map(tab => (
          <NavItem key={tab.id}>
            <NavLink
              active={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{ cursor: 'pointer' }}
              className="d-flex align-items-center"
            >
              <span className="me-2">{tab.icon}</span>
              {tab.label}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
    </div>
  );
};

export default TestDetailsHeader;