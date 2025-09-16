// src/components/navbar/NotificationBell.tsx - Simplified Version
import { AlertTriangle, ArrowRight, Bell, BellOff, RotateCcw } from 'lucide-react';
import React, { useState } from 'react';
import {
  Badge,
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
  UncontrolledDropdown
} from 'reactstrap';
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    isConnected,
    markAllAsRead,
    reconnect
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  // Group notifications by type for simplified display
  const getGroupedNotifications = () => {
    const groups: Record<string, { count: number; latestMessage: string; route: string }> = {};
    
    notifications.forEach(notification => {
      if (notification.isRead) return; // Only count unread notifications
      
      let groupKey = '';
      let route = '';
      let message = '';
      
      switch (notification.type) {
        case 'attempt_request_submitted':
        case 'attempt_request_pending_review':
          groupKey = 'attempt_requests';
          route = '/admin/attempt-requests';
          message = 'test attempt requests';
          break;
        case 'attempt_request_approved':
        case 'attempt_request_rejected':
          groupKey = 'request_decisions';
          route = '/student/requests';
          message = 'request updates';
          break;
        case 'attempts_granted_directly':
          groupKey = 'direct_grants';
          route = '/student/dashboard';
          message = 'additional attempts granted';
          break;
        case 'system_notification':
        case 'test_related':
          groupKey = 'system';
          route = '/notifications';
          message = 'system notifications';
          break;
        default:
          groupKey = 'other';
          route = '/notifications';
          message = 'notifications';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = { count: 0, latestMessage: message, route };
      }
      groups[groupKey].count++;
    });
    
    return groups;
  };

  const groupedNotifications = getGroupedNotifications();
  const hasNotifications = Object.keys(groupedNotifications).length > 0;

  // Handle notification group click
  const handleGroupClick = (route: string) => {
    // Mark all as read when user views notifications
    if (unreadCount > 0) {
      markAllAsRead();
    }
    
    // Navigate to the appropriate page
    window.location.href = route;
    setIsOpen(false);
  };

  // Handle reconnect
  const handleReconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    reconnect();
  };

  return (
    <UncontrolledDropdown 
      nav 
      inNavbar 
      isOpen={isOpen}
      toggle={() => setIsOpen(!isOpen)}
    >
      <DropdownToggle nav className="position-relative p-2" style={{ minWidth: '50px' }}>
        <div className="d-flex align-items-center justify-content-center">
          <Bell
            size={20}
            color="#343a40"
            style={{
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          />
          {unreadCount > 0 && (
            <Badge 
              color="danger" 
              pill 
              className="position-absolute"
              style={{
                top: '0',
                right: '0',
                fontSize: '0.7rem',
                minWidth: '18px',
                height: '18px',
                transform: 'translate(25%, -25%)'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <span 
              className="position-absolute bg-warning rounded-circle"
              style={{
                top: '2px',
                left: '2px',
                width: '8px',
                height: '8px'
              }}
              title="Disconnected"
            />
          )}
        </div>
      </DropdownToggle>

      <DropdownMenu 
        end 
        style={{ 
          width: '320px', 
          maxHeight: '400px',
          padding: '0'
        }}
      >
        {/* Header */}
        <div className="px-3 py-2 border-bottom bg-light d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">Notifications</h6>
          <div className="d-flex gap-2">
            {!isConnected && (
              <Button
                size="sm"
                color="warning"
                outline
                onClick={handleReconnect}
                disabled={loading}
                title="Reconnect"
              >
                <RotateCcw size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <Spinner size="sm" color="primary" />
            <div className="text-muted mt-2">Loading notifications...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="px-3 py-4 text-center">
            <div className="text-danger mb-2">
              <AlertTriangle size={20} />
            </div>
            <div className="text-muted mb-2">{error}</div>
            <Button size="sm" color="primary" outline onClick={handleReconnect}>
              <RotateCcw size={14} className="me-1" />
              Retry
            </Button>
          </div>
        )}

        {/* Simplified Notifications List */}
        {!loading && !error && (
          <div>
            {!hasNotifications ? (
              <div className="px-3 py-4 text-center text-muted">
                <BellOff size={32} className="mb-2 d-block mx-auto" style={{ opacity: 0.3 }} />
                <div>No new notifications</div>
              </div>
            ) : (
              <div>
                {Object.entries(groupedNotifications).map(([key, group]) => (
                  <DropdownItem
                    key={key}
                    onClick={() => handleGroupClick(group.route)}
                    className="border-0 p-0"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="px-3 py-3 border-bottom hover-bg-light">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <div 
                            className="bg-primary rounded-circle me-3"
                            style={{ width: '8px', height: '8px' }}
                          />
                          <div>
                            <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                              {group.count} new {group.latestMessage}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                              Click to view details
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-muted" />
                      </div>
                    </div>
                  </DropdownItem>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {hasNotifications && !loading && !error && (
          <div className="px-3 py-2 border-top bg-light text-center">
            <small className="text-muted">
              Click any notification to view and mark as read
            </small>
          </div>
        )}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default NotificationBell;