// src/components/code-challenges/EditTrackForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Alert,
  Spinner,
  Input,
  Form,
  FormGroup,
  Label,
  Row,
  Col
} from 'reactstrap';
import { Save, ArrowLeft, X } from 'lucide-react';
import { useCodeChallenge } from '../../context/CodeChallengeContext';
import type { AdminTrack, CreateTrackFormData, ProgrammingLanguage, DifficultyLevel, TrackCategory } from '../../types';

interface EditTrackFormProps {
  track: AdminTrack;
  onTrackUpdated: () => void;
  onCancel: () => void;
}

const EditTrackForm: React.FC<EditTrackFormProps> = ({
  track,
  onTrackUpdated,
  onCancel
}) => {
  const { updateCodeTrack } = useCodeChallenge();
  
  const [formData, setFormData] = useState<CreateTrackFormData>({
    title: track.title,
    description: track.description,
    language: track.language,
    category: track.category,
    difficulty: track.difficulty,
    estimatedHours: track.estimatedHours,
    prerequisites: track.prerequisites || [],
    learningObjectives: track.learningObjectives || [],
    isFeatured: track.isFeatured
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learningObjective, setLearningObjective] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateCodeTrack(track.language, track.slug, formData);
      onTrackUpdated();
    } catch (error: any) {
      setError(error.message || 'Failed to update track');
    } finally {
      setLoading(false);
    }
  };

  const addLearningObjective = () => {
    if (learningObjective.trim() && !formData.learningObjectives.includes(learningObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, learningObjective.trim()]
      }));
      setLearningObjective('');
    }
  };

  const removeLearningObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card>
      <CardHeader>
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
            <h5 className="mb-0">Edit Track</h5>
            <small className="text-muted">{track.title}</small>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {error && (
          <Alert color="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <FormGroup>
                <Label for="title">Track Title *</Label>
                <Input
                  type="text"
                  id="title"
                  placeholder="e.g., JavaScript Fundamentals"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="language">Programming Language *</Label>
                <Input
                  type="select"
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as ProgrammingLanguage }))}
                  required
                  disabled // Usually shouldn't change language of existing track
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="dart">Dart</option>
                </Input>
                <small className="text-muted">Language cannot be changed after creation</small>
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label for="description">Description *</Label>
            <Input
              type="textarea"
              id="description"
              rows={3}
              placeholder="Describe what students will learn in this track..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </FormGroup>

          <Row>
            <Col md={4}>
              <FormGroup>
                <Label for="difficulty">Difficulty Level *</Label>
                <Input
                  type="select"
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="category">Category *</Label>
                <Input
                  type="select"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TrackCategory }))}
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="data-structures">Data Structures</option>
                  <option value="algorithms">Algorithms</option>
                  <option value="dynamic-programming">Dynamic Programming</option>
                  <option value="graphs">Graphs</option>
                  <option value="trees">Trees</option>
                  <option value="arrays">Arrays</option>
                  <option value="strings">Strings</option>
                  <option value="linked-lists">Linked Lists</option>
                  <option value="stacks-queues">Stacks & Queues</option>
                  <option value="sorting-searching">Sorting & Searching</option>
                  <option value="math">Math</option>
                  <option value="greedy">Greedy</option>
                  <option value="backtracking">Backtracking</option>
                  <option value="bit-manipulation">Bit Manipulation</option>
                  <option value="design">Design</option>
                  <option value="interview-prep">Interview Prep</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="estimatedHours">Estimated Hours *</Label>
                <Input
                  type="number"
                  id="estimatedHours"
                  min="1"
                  max="100"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) }))}
                  required
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>Learning Objectives</Label>
            <div className="d-flex gap-2 mb-2">
              <Input
                type="text"
                placeholder="Add a learning objective..."
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningObjective())}
              />
              <Button
                type="button"
                color="outline-primary"
                onClick={addLearningObjective}
                disabled={!learningObjective.trim()}
              >
                Add
              </Button>
            </div>
            {formData.learningObjectives.length > 0 && (
              <div className="border rounded p-2">
                {formData.learningObjectives.map((objective, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center py-1">
                    <span className="small">{objective}</span>
                    <Button
                      type="button"
                      color="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={() => removeLearningObjective(index)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </FormGroup>

          <Row>
            <Col md={12}>
              <FormGroup check>
                <Input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                />
                <Label check for="isFeatured">
                  Featured Track (will be highlighted on the platform)
                </Label>
              </FormGroup>
            </Col>
          </Row>

          <div className="d-flex gap-2 mt-4">
            <Button color="secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="me-2 icon-sm" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Form>
      </CardBody>

      <style>{`
        .icon-sm {
          width: 16px;
          height: 16px;
        }
      `}</style>
    </Card>
  );
};

export default EditTrackForm;