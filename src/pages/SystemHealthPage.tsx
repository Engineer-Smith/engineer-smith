import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Container, 
  Card, 
  CardBody, 
  CardTitle, 
  Row, 
  Col, 
  Badge, 
  Alert,
  Button,
  Progress
} from "reactstrap";

interface SystemHealthData {
  status: string;
  timestamp: string;
  uptime: number;
  database: {
    status: string;
    host: string;
    name: string;
  };
  memory: {
    used: string;
    heap: string;
    external: string;
  };
  environment: string;
  nodeVersion: string;
}

const SystemHealthPage: React.FC = () => {
  const { client } = useAuth();
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchHealthData = async () => {
    try {
      setError(null);
      const response = await client.get('/admin/system/health');
      setHealthData(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch system health data');
      console.error('System health error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'OK' || status === 'Connected' ? 'success' : 'danger';
  };

  const parseMemory = (memoryString: string): number => {
    const match = memoryString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const getMemoryUsagePercent = (used: string, total: number = 512) => {
    const usedMB = parseMemory(used);
    return Math.round((usedMB / total) * 100);
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading system health...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0 font-weight-bold">System Health</h1>
        <div className="d-flex align-items-center">
          <small className="text-muted mr-3">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </small>
          <Button color="outline-primary" size="sm" onClick={fetchHealthData}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert color="danger" className="mb-4">
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {healthData && (
        <>
          {/* Overall Status */}
          <Row className="mb-4">
            <Col>
              <Card className="border-0 shadow-sm">
                <CardBody className="text-center">
                  <div className="mb-3">
                    <Badge 
                      color={getStatusColor(healthData.status)} 
                      className="h4 px-3 py-2"
                    >
                      System {healthData.status}
                    </Badge>
                  </div>
                  <p className="text-muted mb-0">
                    Server has been running for <strong>{formatUptime(healthData.uptime)}</strong>
                  </p>
                  <small className="text-muted">
                    Environment: {healthData.environment} | Node.js {healthData.nodeVersion}
                  </small>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            {/* Database Status */}
            <Col md="6" className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <CardTitle tag="h5" className="mb-3">
                    <i className="fas fa-database mr-2"></i>
                    Database Status
                  </CardTitle>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Connection Status</span>
                      <Badge color={getStatusColor(healthData.database.status)}>
                        {healthData.database.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Host:</strong> {healthData.database.host}
                    </small>
                  </div>
                  
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Database:</strong> {healthData.database.name}
                    </small>
                  </div>

                  {healthData.database.status === 'Connected' && (
                    <div className="mt-3">
                      <small className="text-success">
                        <i className="fas fa-check-circle mr-1"></i>
                        All database operations are functioning normally
                      </small>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* Memory Usage */}
            <Col md="6" className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <CardTitle tag="h5" className="mb-3">
                    <i className="fas fa-memory mr-2"></i>
                    Memory Usage
                  </CardTitle>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>Total Memory (RSS)</span>
                      <span className="font-weight-bold">{healthData.memory.used}</span>
                    </div>
                    <Progress 
                      value={getMemoryUsagePercent(healthData.memory.used)} 
                      color={getMemoryUsagePercent(healthData.memory.used) > 80 ? "danger" : 
                             getMemoryUsagePercent(healthData.memory.used) > 60 ? "warning" : "success"}
                    />
                    <small className="text-muted">
                      {getMemoryUsagePercent(healthData.memory.used)}% of estimated 512MB
                    </small>
                  </div>

                  <div className="mb-2">
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">Heap Memory:</small>
                      <small className="text-muted">{healthData.memory.heap}</small>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">External Memory:</small>
                      <small className="text-muted">{healthData.memory.external}</small>
                    </div>
                  </div>

                  {getMemoryUsagePercent(healthData.memory.used) > 80 && (
                    <div className="mt-3">
                      <small className="text-warning">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        High memory usage detected
                      </small>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Additional Info */}
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <CardBody>
                  <CardTitle tag="h5" className="mb-3">
                    <i className="fas fa-info-circle mr-2"></i>
                    System Information
                  </CardTitle>
                  
                  <Row>
                    <Col md="4">
                      <div className="mb-2">
                        <small className="text-muted d-block">Server Time</small>
                        <span>{new Date(healthData.timestamp).toLocaleString()}</span>
                      </div>
                    </Col>
                    
                    <Col md="4">
                      <div className="mb-2">
                        <small className="text-muted d-block">Environment</small>
                        <Badge color={healthData.environment === 'production' ? 'success' : 'warning'}>
                          {healthData.environment}
                        </Badge>
                      </div>
                    </Col>
                    
                    <Col md="4">
                      <div className="mb-2">
                        <small className="text-muted d-block">Node.js Version</small>
                        <span>{healthData.nodeVersion}</span>
                      </div>
                    </Col>
                  </Row>

                  <hr className="my-3" />
                  
                  <div className="text-center">
                    <small className="text-muted">
                      Health data automatically refreshes every 30 seconds
                    </small>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default SystemHealthPage;