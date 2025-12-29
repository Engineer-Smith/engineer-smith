// src/components/code-challenges/TracksList.tsx
import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Alert,
  Spinner,
  Input,
  InputGroup,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import {
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Book,
  Plus,
  Users,
  Clock,
  Star
} from 'lucide-react';
import type { AdminTrack } from '../../types';

interface TracksListProps {
  tracks: AdminTrack[];
  loading: boolean;
  onAssignChallenges: (track: AdminTrack) => void;
  onEditTrack: (track: AdminTrack) => void;
  onRefresh: () => void;
}

const TracksList: React.FC<TracksListProps> = ({
  tracks,
  loading,
  onAssignChallenges,
  onEditTrack,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter functions
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || track.language === filterLanguage;
    const matchesDifficulty = filterDifficulty === 'all' || track.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'published' ? track.isActive : !track.isActive);
    
    return matchesSearch && matchesLanguage && matchesDifficulty && matchesStatus;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'javascript': return 'warning';
      case 'python': return 'info';
      case 'dart': return 'primary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
        <div className="mt-3">Loading tracks...</div>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filters */}
      <Card className="mb-4">
        <CardBody>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <span className="input-group-text">
                  <Search className="icon-sm" />
                </span>
                <Input
                  type="text"
                  placeholder="Search tracks..."
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
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Input>
            </Col>
            <Col md={2}>
              <Input
                type="select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Input>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="text-muted">
            Showing {filteredTracks.length} of {tracks.length} tracks
          </span>
        </div>
        <Button color="outline-primary" size="sm" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {/* Tracks Grid */}
      {filteredTracks.length === 0 ? (
        <Alert color="info" className="text-center">
          <Book size={48} className="mb-3" />
          <h5>No tracks found</h5>
          <p className="mb-0">
            {tracks.length === 0 
              ? "No tracks have been created yet."
              : "No tracks match your current filters."
            }
          </p>
        </Alert>
      ) : (
        <div className="tracks-list">
          <Row>
            {filteredTracks.map((track) => (
              <Col lg={4} md={6} key={track._id} className="mb-4">
                <Card className="h-100">
                  <CardHeader className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{track.title}</h6>
                      <div className="d-flex gap-2 flex-wrap">
                        <Badge color={getLanguageColor(track.language)} size="sm">
                          {track.language}
                        </Badge>
                        <Badge color={getDifficultyColor(track.difficulty)} size="sm">
                          {track.difficulty}
                        </Badge>
                        {track.isFeatured && (
                          <Badge color="primary" size="sm">
                            <Star className="me-1" style={{ width: '12px', height: '12px' }} />
                            Featured
                          </Badge>
                        )}
                        <Badge color={track.isActive ? 'success' : 'secondary'} size="sm">
                          {track.isActive ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                    <UncontrolledDropdown>
                      <DropdownToggle tag="button" className="btn btn-link btn-sm text-muted">
                        <MoreHorizontal size={16} />
                      </DropdownToggle>
                      <DropdownMenu end>
                        <DropdownItem onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEditTrack(track);
                        }}>
                          <Edit className="me-2 icon-sm" />
                          Edit Track Details
                        </DropdownItem>
                        <DropdownItem onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onAssignChallenges(track);
                        }}>
                          <Plus className="me-2 icon-sm" />
                          Manage Challenges
                        </DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem className="text-danger">
                          <Trash2 className="me-2 icon-sm" />
                          Delete Track
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </CardHeader>
                  <CardBody>
                    <p className="text-muted small mb-3">
                      {track.description.length > 100 
                        ? `${track.description.substring(0, 100)}...`
                        : track.description
                      }
                    </p>
                    
                    <div className="d-flex justify-content-between text-muted small mb-3">
                      <div className="d-flex align-items-center">
                        <Book className="me-1 icon-sm" />
                        {track.challenges.length} challenges
                      </div>
                      <div className="d-flex align-items-center">
                        <Clock className="me-1 icon-sm" />
                        {track.estimatedHours}h
                      </div>
                      <div className="d-flex align-items-center">
                        <Users className="me-1 icon-sm" />
                        {track.stats.totalEnrolled}
                      </div>
                    </div>

                    {track.stats.totalRatings > 0 && (
                      <div className="d-flex align-items-center mb-3">
                        <Star className="me-1 text-warning" style={{ width: '14px', height: '14px' }} />
                        <span className="small">
                          {track.stats.rating.toFixed(1)} ({track.stats.totalRatings} reviews)
                        </span>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <Button
                        color="primary"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onAssignChallenges(track);
                        }}
                      >
                        <Plus className="me-1 icon-sm" />
                        Challenges
                      </Button>
                      <Button
                        color="outline-secondary"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEditTrack(track);
                        }}
                      >
                        <Edit className="me-1 icon-sm" />
                        Edit
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <style>{`
        .tracks-list .card:hover {
          box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1) !important;
          transition: box-shadow 0.2s ease;
        }
        .icon-sm {
          width: 16px;
          height: 16px;
        }
      `}</style>
    </>
  );
};

export default TracksList;