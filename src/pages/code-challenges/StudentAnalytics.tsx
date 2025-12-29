// src/pages/admin/code-challenges/StudentAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCodeChallenge } from '../../context/CodeChallengeContext';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Table,
  Badge,
  Button,
  Input,
  InputGroup,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Progress,
  Alert,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';
import {
  Users,
  Search,
  TrendingUp,
  Clock,
  Trophy,
  Target,
  BarChart3,
  Activity,
  Download,
  Filter,
  Calendar,
  User,
  Code,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

interface StudentProgress {
  userId: string;
  name: string;
  email: string;
  totalTracksEnrolled: number;
  totalTracksCompleted: number;
  totalChallengesAttempted: number;
  totalChallengesSolved: number;
  averageAttempts: number;
  averageTime: number;
  lastActivity: string;
  currentStreak: number;
  totalTimeSpent: number;
  skillLevels: {
    [language: string]: {
      level: 'beginner' | 'intermediate' | 'advanced';
      score: number;
      challengesSolved: number;
    };
  };
  recentActivity: Array<{
    challengeId: string;
    challengeTitle: string;
    trackId: string;
    trackTitle: string;
    status: 'completed' | 'attempted' | 'failed';
    timeSpent: number;
    attempts: number;
    submittedAt: string;
  }>;
}

interface TrackAnalytics {
  trackId: string;
  title: string;
  language: string;
  difficulty: string;
  totalEnrolled: number;
  totalCompleted: number;
  averageCompletionTime: number;
  completionRate: number;
  dropoffPoints: Array<{
    challengeId: string;
    challengeTitle: string;
    dropoffRate: number;
    position: number;
  }>;
  difficultyProgression: Array<{
    challengeId: string;
    challengeTitle: string;
    averageAttempts: number;
    successRate: number;
    averageTime: number;
  }>;
}

interface ChallengeAnalytics {
  challengeId: string;
  title: string;
  difficulty: string;
  language: string;
  totalAttempts: number;
  uniqueAttempts: number;
  successRate: number;
  averageAttempts: number;
  averageTime: number;
  commonErrors: Array<{
    error: string;
    frequency: number;
    percentage: number;
  }>;
  timeDistribution: {
    under5min: number;
    under15min: number;
    under30min: number;
    under1hour: number;
    over1hour: number;
  };
}

const StudentAnalytics: React.FC = () => {
  const { loadAnalytics } = useCodeChallenge();
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Mock data - In real implementation, this would come from API
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([
    {
      userId: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      totalTracksEnrolled: 3,
      totalTracksCompleted: 1,
      totalChallengesAttempted: 25,
      totalChallengesSolved: 18,
      averageAttempts: 2.3,
      averageTime: 1245, // seconds
      lastActivity: '2024-01-15T10:30:00Z',
      currentStreak: 7,
      totalTimeSpent: 31230, // seconds
      skillLevels: {
        javascript: { level: 'intermediate', score: 785, challengesSolved: 12 },
        python: { level: 'beginner', score: 420, challengesSolved: 6 }
      },
      recentActivity: []
    },
    {
      userId: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      totalTracksEnrolled: 2,
      totalTracksCompleted: 0,
      totalChallengesAttempted: 15,
      totalChallengesSolved: 8,
      averageAttempts: 3.1,
      averageTime: 1890,
      lastActivity: '2024-01-14T15:22:00Z',
      currentStreak: 3,
      totalTimeSpent: 28350,
      skillLevels: {
        dart: { level: 'beginner', score: 320, challengesSolved: 8 }
      },
      recentActivity: []
    }
  ]);

  const [trackAnalytics, setTrackAnalytics] = useState<TrackAnalytics[]>([
    {
      trackId: '1',
      title: 'JavaScript Fundamentals',
      language: 'javascript',
      difficulty: 'beginner',
      totalEnrolled: 145,
      totalCompleted: 89,
      averageCompletionTime: 18000, // seconds
      completionRate: 61.4,
      dropoffPoints: [
        { challengeId: '1', challengeTitle: 'Array Methods', dropoffRate: 15.2, position: 3 },
        { challengeId: '2', challengeTitle: 'Async/Await', dropoffRate: 23.1, position: 7 }
      ],
      difficultyProgression: []
    }
  ]);

  const [challengeAnalytics, setChallengeAnalytics] = useState<ChallengeAnalytics[]>([]);

  useEffect(() => {
    loadAnalytics(selectedTimeRange as '7d' | '30d' | '90d');
  }, [selectedTimeRange]);

  // Filter and sort functions
  const filteredStudents = studentsProgress
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = filterLanguage === 'all' || Object.keys(student.skillLevels).includes(filterLanguage);
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'progress':
          aValue = a.totalChallengesSolved / Math.max(a.totalChallengesAttempted, 1);
          bValue = b.totalChallengesSolved / Math.max(b.totalChallengesAttempted, 1);
          break;
        case 'streak':
          aValue = a.currentStreak;
          bValue = b.currentStreak;
          break;
        case 'lastActivity':
        default:
          aValue = new Date(a.lastActivity).getTime();
          bValue = new Date(b.lastActivity).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Utility functions
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'danger';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
      case 'beginner': return 'success';
      case 'medium':
      case 'intermediate': return 'warning';
      case 'hard':
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'info';
      case 'intermediate': return 'warning';
      case 'advanced': return 'success';
      default: return 'secondary';
    }
  };

  // Calculate overview stats
  const totalStudents = studentsProgress.length;
  const activeStudents = studentsProgress.filter(s => {
    const lastActivity = new Date(s.lastActivity);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastActivity > weekAgo;
  }).length;
  
  const averageProgress = studentsProgress.reduce((sum, student) => {
    return sum + (student.totalChallengesSolved / Math.max(student.totalChallengesAttempted, 1));
  }, 0) / Math.max(totalStudents, 1) * 100;

  const totalChallengesAttempted = studentsProgress.reduce((sum, s) => sum + s.totalChallengesAttempted, 0);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <BarChart3 className="me-2 icon-md" />
                Student Analytics
              </h2>
              <p className="text-muted mb-0">Track student progress and performance across code challenges</p>
            </div>
            <div className="d-flex gap-2">
              <Input
                type="select"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </Input>
              <Button color="outline-primary" size="sm">
                <Download className="me-2 icon-sm" />
                Export
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Navigation Tabs */}
      <Nav tabs className="mb-4">
        <NavItem>
          <NavLink
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
            style={{ cursor: 'pointer' }}
          >
            <Activity className="me-2 icon-sm" />
            Overview
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === 'students' ? 'active' : ''}
            onClick={() => setActiveTab('students')}
            style={{ cursor: 'pointer' }}
          >
            <Users className="me-2 icon-sm" />
            Student Progress
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === 'tracks' ? 'active' : ''}
            onClick={() => setActiveTab('tracks')}
            style={{ cursor: 'pointer' }}
          >
            <Target className="me-2 icon-sm" />
            Track Analytics
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === 'challenges' ? 'active' : ''}
            onClick={() => setActiveTab('challenges')}
            style={{ cursor: 'pointer' }}
          >
            <Code className="me-2 icon-sm" />
            Challenge Performance
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab}>
        {/* Overview Tab */}
        <TabPane tabId="overview">
          {/* Summary Stats */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="h-100">
                <CardBody className="text-center">
                  <Users className="text-primary mb-2" size={32} />
                  <h3 className="mb-1">{totalStudents}</h3>
                  <p className="text-muted mb-0 small">Total Students</p>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100">
                <CardBody className="text-center">
                  <Activity className="text-success mb-2" size={32} />
                  <h3 className="mb-1">{activeStudents}</h3>
                  <p className="text-muted mb-0 small">Active This Week</p>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100">
                <CardBody className="text-center">
                  <TrendingUp className="text-warning mb-2" size={32} />
                  <h3 className="mb-1">{averageProgress.toFixed(1)}%</h3>
                  <p className="text-muted mb-0 small">Avg. Progress</p>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100">
                <CardBody className="text-center">
                  <Code className="text-info mb-2" size={32} />
                  <h3 className="mb-1">{totalChallengesAttempted}</h3>
                  <p className="text-muted mb-0 small">Total Attempts</p>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity & Top Performers */}
          <Row>
            <Col lg={6}>
              <Card className="h-100">
                <CardHeader>
                  <h5 className="mb-0">Recent Activity</h5>
                </CardHeader>
                <CardBody>
                  <div className="activity-feed">
                    {studentsProgress
                      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
                      .slice(0, 5)
                      .map(student => (
                        <div key={student.userId} className="d-flex align-items-center mb-3">
                          <div className="me-3">
                            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" 
                                 style={{ width: '32px', height: '32px' }}>
                              <User className="text-white" size={16} />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold">{student.name}</div>
                            <small className="text-muted">
                              Solved {student.totalChallengesSolved} challenges • {formatTimeAgo(student.lastActivity)}
                            </small>
                          </div>
                          <Badge color={student.currentStreak > 5 ? 'success' : 'secondary'}>
                            {student.currentStreak} day streak
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col lg={6}>
              <Card className="h-100">
                <CardHeader>
                  <h5 className="mb-0">Top Performers</h5>
                </CardHeader>
                <CardBody>
                  <div className="leaderboard">
                    {studentsProgress
                      .sort((a, b) => b.totalChallengesSolved - a.totalChallengesSolved)
                      .slice(0, 5)
                      .map((student, index) => (
                        <div key={student.userId} className="d-flex align-items-center mb-3">
                          <div className="me-3">
                            <Badge 
                              color={index === 0 ? 'warning' : index === 1 ? 'secondary' : index === 2 ? 'dark' : 'light'}
                              className="rounded-pill"
                            >
                              #{index + 1}
                            </Badge>
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold">{student.name}</div>
                            <small className="text-muted">
                              {student.totalChallengesSolved} solved • {((student.totalChallengesSolved / Math.max(student.totalChallengesAttempted, 1)) * 100).toFixed(1)}% success rate
                            </small>
                          </div>
                          <div className="text-end">
                            <Trophy className="text-warning" size={20} />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Students Tab */}
        <TabPane tabId="students">
          {/* Filters */}
          <Row className="mb-4">
            <Col md={4}>
              <InputGroup>
                <span className="input-group-text">
                  <Search className="icon-sm" />
                </span>
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Input
                type="select"
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
              >
                <option value="all">All Languages</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="dart">Dart</option>
              </Input>
            </Col>
            <Col md={2}>
              <Input
                type="select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="lastActivity">Last Activity</option>
                <option value="name">Name</option>
                <option value="progress">Progress</option>
                <option value="streak">Streak</option>
              </Input>
            </Col>
            <Col md={2}>
              <Input
                type="select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Input>
            </Col>
          </Row>

          {/* Students Table */}
          <Card>
            <CardBody className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Student</th>
                    <th>Progress</th>
                    <th>Success Rate</th>
                    <th>Current Streak</th>
                    <th>Time Spent</th>
                    <th>Skills</th>
                    <th>Last Activity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const successRate = (student.totalChallengesSolved / Math.max(student.totalChallengesAttempted, 1)) * 100;
                    return (
                      <tr key={student.userId}>
                        <td>
                          <div>
                            <div className="fw-bold">{student.name}</div>
                            <small className="text-muted">{student.email}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small>{student.totalChallengesSolved}/{student.totalChallengesAttempted}</small>
                              <small>{successRate.toFixed(1)}%</small>
                            </div>
                            <Progress 
                              value={successRate} 
                              color={getSuccessRateColor(successRate)}
                              className="progress-sm"
                            />
                          </div>
                        </td>
                        <td>
                          <Badge color={getSuccessRateColor(successRate)}>
                            {successRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Trophy className="me-1 icon-sm text-warning" />
                            {student.currentStreak} days
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Clock className="me-1 icon-sm text-muted" />
                            {formatTime(student.totalTimeSpent)}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            {Object.entries(student.skillLevels).map(([lang, skill]) => (
                              <Badge 
                                key={lang}
                                color={getSkillLevelColor(skill.level)}
                                size="sm"
                                title={`${lang}: ${skill.challengesSolved} solved`}
                              >
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatTimeAgo(student.lastActivity)}
                          </small>
                        </td>
                        <td>
                          <Button color="outline-primary" size="sm">
                            <Eye className="icon-sm" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </TabPane>

        {/* Track Analytics Tab */}
        <TabPane tabId="tracks">
          <Row>
            {trackAnalytics.map((track) => (
              <Col key={track.trackId} lg={6} className="mb-4">
                <Card className="h-100">
                  <CardHeader>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{track.title}</h6>
                        <div className="d-flex gap-2">
                          <Badge color="info" size="sm">{track.language}</Badge>
                          <Badge color={getDifficultyColor(track.difficulty)} size="sm">
                            {track.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <Badge color="primary">{track.completionRate.toFixed(1)}%</Badge>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <Row className="mb-3">
                      <Col xs={6}>
                        <div className="text-center">
                          <div className="fw-bold text-primary">{track.totalEnrolled}</div>
                          <small className="text-muted">Enrolled</small>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="text-center">
                          <div className="fw-bold text-success">{track.totalCompleted}</div>
                          <small className="text-muted">Completed</small>
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small>Completion Rate</small>
                        <small>{track.completionRate.toFixed(1)}%</small>
                      </div>
                      <Progress 
                        value={track.completionRate} 
                        color={getSuccessRateColor(track.completionRate)}
                        className="progress-sm"
                      />
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block">Average completion time</small>
                      <div className="fw-bold">{formatTime(track.averageCompletionTime)}</div>
                    </div>

                    {track.dropoffPoints.length > 0 && (
                      <div>
                        <small className="text-muted d-block mb-2">Main dropoff points</small>
                        {track.dropoffPoints.slice(0, 2).map((point) => (
                          <div key={point.challengeId} className="d-flex justify-content-between align-items-center mb-1">
                            <small>{point.challengeTitle}</small>
                            <Badge color="warning" size="sm">{point.dropoffRate.toFixed(1)}%</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        {/* Challenge Performance Tab */}
        <TabPane tabId="challenges">
          <Alert color="info">
            <AlertCircle className="me-2 icon-sm" />
            Challenge performance analytics will be populated with real data from your seeding script and student submissions.
          </Alert>
          
          <Card>
            <CardHeader>
              <h5 className="mb-0">Challenge Performance Overview</h5>
            </CardHeader>
            <CardBody>
              <p className="text-muted">
                This section will show detailed analytics for individual challenges including:
              </p>
              <ul className="text-muted">
                <li>Success rates and average attempts per challenge</li>
                <li>Common error patterns and debugging insights</li>
                <li>Time distribution analysis</li>
                <li>Difficulty calibration recommendations</li>
                <li>Most problematic test cases</li>
              </ul>
            </CardBody>
          </Card>
        </TabPane>
      </TabContent>

      <style>{`
        .progress-sm {
          height: 6px;
        }
        .icon-sm {
          width: 16px;
          height: 16px;
        }
        .icon-md {
          width: 20px;
          height: 20px;
        }
        .activity-feed .rounded-circle {
          flex-shrink: 0;
        }
      `}</style>
    </Container>
  );
};

export default StudentAnalytics;