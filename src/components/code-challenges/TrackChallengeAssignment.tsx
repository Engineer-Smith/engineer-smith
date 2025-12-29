// src/components/code-challenges/TrackChallengeAssignment.tsx
import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Alert,
  Spinner,
  Input,
  InputGroup,
  Row,
  Col
} from 'reactstrap';
import {
  Search,
  Plus,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  X,
  Code,
  GripVertical
} from 'lucide-react';
import { useCodeChallenge } from '../../context/CodeChallengeContext';
import type { AdminTrack } from '../../types';

interface TrackChallengeAssignmentProps {
  track: AdminTrack;
  onComplete: () => void;
  onCancel: () => void;
}

const TrackChallengeAssignment: React.FC<TrackChallengeAssignmentProps> = ({
  track,
  onComplete,
  onCancel
}) => {
  const {
    adminChallenges,
    addChallengeToTrack,
    removeChallengeFromTrack
  } = useCodeChallenge();

  const [challengeSearchTerm, setChallengeSearchTerm] = useState('');
  const [assigningStates, setAssigningStates] = useState<Record<string, boolean>>({});
  const [removingStates, setRemovingStates] = useState<Record<string, boolean>>({});

  // Filter challenges for this track's language and exclude already assigned ones
  const filteredChallenges = adminChallenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(challengeSearchTerm.toLowerCase());
    const matchesLanguage = challenge.supportedLanguages.includes(track.language);
    const notInTrack = !track.challenges.some(tc => tc.challengeId === challenge._id);
    return matchesSearch && matchesLanguage && notInTrack;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  };

  const handleAssignChallenge = async (challengeId: string) => {
    setAssigningStates(prev => ({ ...prev, [challengeId]: true }));
    
    try {
      const nextOrder = track.challenges.length + 1;
      await addChallengeToTrack(track.language, track.slug, {
        challengeId,
        order: nextOrder,
        isOptional: false
      });
      
      // No need to update local state since parent will refresh
    } catch (error) {
      console.error('Error assigning challenge:', error);
      // You could show an error toast here
    } finally {
      setAssigningStates(prev => ({ ...prev, [challengeId]: false }));
    }
  };

  const handleRemoveChallenge = async (challengeId: string) => {
    setRemovingStates(prev => ({ ...prev, [challengeId]: true }));
    
    try {
      await removeChallengeFromTrack(track.language, track.slug, challengeId);
      // No need to update local state since parent will refresh
    } catch (error) {
      console.error('Error removing challenge:', error);
      // You could show an error toast here
    } finally {
      setRemovingStates(prev => ({ ...prev, [challengeId]: false }));
    }
  };

  return (
    <div>
      <Card className="mb-4">
        <CardHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Button
                color="link"
                size="sm"
                className="text-muted p-0 me-3"
                onClick={onCancel}
              >
                <ArrowLeft size={18} />
              </Button>
              <div>
                <h5 className="mb-0">Manage Challenges</h5>
                <small className="text-muted">{track.title}</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button color="outline-primary" onClick={onCancel}>
                Cancel
              </Button>
              <Button color="primary" onClick={onComplete}>
                Done
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Row>
        {/* Current Challenges */}
        <Col lg={6}>
          <Card>
            <CardHeader>
              <h6 className="mb-0">
                Current Challenges ({track.challenges.length})
              </h6>
            </CardHeader>
            <CardBody>
              {track.challenges.length === 0 ? (
                <div className="text-center py-4">
                  <Code size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No challenges assigned</h6>
                  <p className="text-muted small">
                    Start by assigning challenges from the available list.
                  </p>
                </div>
              ) : (
                <div className="challenges-list">
                  {track.challenges
                    .sort((a, b) => a.order - b.order)
                    .map((challenge, index) => {
                      // Find the full challenge data
                      const fullChallenge = adminChallenges.find(c => c._id === challenge.challengeId);
                      if (!fullChallenge) return null;

                      return (
                        <Card key={challenge.challengeId} className="mb-2">
                          <CardBody className="p-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="d-flex align-items-start">
                                <div className="me-3">
                                  <GripVertical className="text-muted" size={16} />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center mb-1">
                                    <span className="badge bg-light text-dark me-2">
                                      #{challenge.order}
                                    </span>
                                    <h6 className="mb-0">{fullChallenge.title}</h6>
                                  </div>
                                  <div className="d-flex gap-2 mb-2">
                                    <Badge color={getDifficultyColor(fullChallenge.difficulty)} size="sm">
                                      {fullChallenge.difficulty}
                                    </Badge>
                                    <Badge color="info" size="sm">
                                      {fullChallenge.topics?.[0] || 'General'}
                                    </Badge>
                                    {challenge.isOptional && (
                                      <Badge color="warning" size="sm">
                                        Optional
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-muted small mb-0">
                                    {fullChallenge.description.length > 80 
                                      ? `${fullChallenge.description.substring(0, 80)}...`
                                      : fullChallenge.description
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="d-flex flex-column gap-1">
                                <Button
                                  color="outline-secondary"
                                  size="sm"
                                  disabled={index === 0}
                                  style={{ padding: '2px 6px' }}
                                >
                                  <ArrowUp size={12} />
                                </Button>
                                <Button
                                  color="outline-secondary"
                                  size="sm"
                                  disabled={index === track.challenges.length - 1}
                                  style={{ padding: '2px 6px' }}
                                >
                                  <ArrowDown size={12} />
                                </Button>
                                <Button
                                  color="outline-danger"
                                  size="sm"
                                  onClick={() => handleRemoveChallenge(challenge.challengeId)}
                                  disabled={removingStates[challenge.challengeId]}
                                  style={{ padding: '2px 6px' }}
                                >
                                  {removingStates[challenge.challengeId] ? (
                                    <Spinner size="sm" />
                                  ) : (
                                    <X size={12} />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Available Challenges */}
        <Col lg={6}>
          <Card>
            <CardHeader>
              <h6 className="mb-0">Available Challenges</h6>
            </CardHeader>
            <CardBody>
              <div className="mb-3">
                <InputGroup>
                  <span className="input-group-text">
                    <Search className="icon-sm" />
                  </span>
                  <Input
                    type="text"
                    placeholder="Search available challenges..."
                    value={challengeSearchTerm}
                    onChange={(e) => setChallengeSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </div>

              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {filteredChallenges.length === 0 ? (
                  <div className="text-center py-4">
                    <Code size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">No available challenges</h6>
                    <p className="text-muted small">
                      {challengeSearchTerm 
                        ? "No challenges match your search criteria."
                        : `All ${track.language} challenges have been assigned to this track.`
                      }
                    </p>
                  </div>
                ) : (
                  filteredChallenges.map((challenge) => (
                    <Card key={challenge._id} className="mb-2">
                      <CardBody className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{challenge.title}</h6>
                            <div className="d-flex gap-2 mb-2">
                              <Badge color={getDifficultyColor(challenge.difficulty)} size="sm">
                                {challenge.difficulty}
                              </Badge>
                              <Badge color="info" size="sm">
                                {challenge.topics?.[0] || 'General'}
                              </Badge>
                            </div>
                            <p className="text-muted small mb-0">
                              {challenge.description.length > 100 
                                ? `${challenge.description.substring(0, 100)}...`
                                : challenge.description
                              }
                            </p>
                          </div>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => handleAssignChallenge(challenge._id)}
                            disabled={assigningStates[challenge._id]}
                          >
                            {assigningStates[challenge._id] ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <Plus className="me-1 icon-sm" />
                                Assign
                              </>
                            )}
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <style>{`
        .challenges-list .card:hover {
          box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1) !important;
          transition: box-shadow 0.2s ease;
        }
        .icon-sm {
          width: 16px;
          height: 16px;
        }
      `}</style>
    </div>
  );
};

export default TrackChallengeAssignment;