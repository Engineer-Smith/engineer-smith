import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Alert,
} from "reactstrap";
import { useAuth } from "../context/AuthContext";
import type { Question } from "../types";

interface QuestionCardProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: (questionId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onUpdate, onDelete }) => {
  const { client } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editData, setEditData] = useState<Question>(question);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Preview state for student simulation
  const [previewAnswer, setPreviewAnswer] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const formatType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "success";
      case "intermediate": return "warning";
      case "advanced": return "danger";
      default: return "secondary";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "multiple_choice": return "primary";
      case "true_false": return "info";
      case "code_challenge": return "warning";
      case "debug_fix": return "danger";
      default: return "secondary";
    }
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
    setPreviewAnswer(null);
    setShowExplanation(false);
  };

  const handlePreviewAnswer = () => {
    setShowExplanation(true);
  };

  const resetPreview = () => {
    setPreviewAnswer(null);
    setShowExplanation(false);
  };

  const handleEdit = () => {
    setEditData({ ...question });
    setShowEditModal(true);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("content.")) {
      const contentKey = name.split(".")[1];
      setEditData(prev => ({
        ...prev,
        content: { ...prev.content, [contentKey]: value }
      }));
    } else if (name === "tags") {
      setEditData(prev => ({ 
        ...prev, 
        tags: value.split(",").map(tag => tag.trim()).filter(Boolean) 
      }));
    } else {
      setEditData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === "content.shuffleOptions") {
      setEditData(prev => ({
        ...prev,
        content: { ...prev.content, shuffleOptions: checked }
      }));
    } else if (name === "content.correctBoolean") {
      setEditData(prev => ({
        ...prev,
        content: { ...prev.content, correctBoolean: checked }
      }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    setEditData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        options: prev.content.options?.map((opt, i) => i === index ? value : opt) || []
      }
    }));
  };

  const handleSaveEdit = async () => {
    if (!editData.title || !editData.description || !editData.type || !editData.skill) {
      setError("Title, description, type, and skill are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        title: editData.title,
        description: editData.description,
        type: editData.type,
        skill: editData.skill,
        category: editData.category,
        difficulty: editData.difficulty,
        points: parseInt(editData.points.toString()),
        timeEstimate: parseInt(editData.timeEstimate.toString()),
        weight: parseFloat(editData.weight.toString()),
        tags: editData.tags,
        content: {
          explanation: editData.content.explanation,
          codeSnippet: editData.content.codeSnippet,
          correctBoolean: editData.type === "true_false" ? editData.content.correctBoolean : undefined,
          options: editData.type === "multiple_choice" ? editData.content.options : undefined,
          correctAnswer: editData.type === "multiple_choice" ? editData.content.correctAnswer : undefined,
          shuffleOptions: editData.type === "multiple_choice" ? editData.content.shuffleOptions : undefined,
          language: editData.content.language,
          starterCode: editData.content.starterCode,
          brokenCode: editData.content.brokenCode,
          bugHint: editData.content.bugHint,
          hints: editData.content.hints,
        }
      };

      const res = await client.put(`/questions/${question._id}`, updateData);
      
      // Update the question in the parent component
      onUpdate({ ...editData, ...res.data.question });
      setShowEditModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update question");
      console.error("Update question error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await client.delete(`/questions/${question._id}`);
      onDelete(question._id);
      setShowDeleteModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete question");
      console.error("Delete question error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-4 border-0 shadow-sm">
        <CardBody>
          {/* Header with title and action buttons */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="flex-grow-1">
              <CardTitle tag="h3" className="h5 mb-2 font-weight-bold">
                {question.title}
              </CardTitle>
              <div className="mb-2">
                <Badge color={getDifficultyColor(question.difficulty)} className="mr-2">
                  {question.difficulty}
                </Badge>
                <Badge color={getTypeColor(question.type)} className="mr-2">
                  {formatType(question.type)}
                </Badge>
                <Badge color="secondary" className="mr-2">
                  {question.points} pts
                </Badge>
                <Badge color="light" className="text-muted">
                  ~{Math.ceil(question.timeEstimate / 60)} min
                </Badge>
              </div>
            </div>
            <div className="d-flex gap-2 ml-3">
              <Button color="outline-info" size="sm" onClick={handlePreview}>
                Preview
              </Button>
              <Button color="outline-primary" size="sm" onClick={handleEdit}>
                Edit
              </Button>
              <Button color="outline-danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
            </div>
          </div>

          {/* Question details in a scannable format */}
          <CardText>
            <div className="mb-3">
              <strong>Question:</strong> {question.description}
            </div>
            
            {/* Show answer for quick reference */}
            {question.type === "true_false" && (
              <div className="mb-2">
                <strong>Answer:</strong> 
                <span className="text-success font-weight-bold ml-1">
                  {question.content.correctBoolean ? "True" : "False"}
                </span>
              </div>
            )}

            {question.type === "multiple_choice" && question.content.options && (
              <div className="mb-2">
                <strong>Answer Choices:</strong>
                <div className="mt-1 ml-3">
                  {question.content.options.map((option, idx) => (
                    <div key={idx} className={`mb-1 ${idx === question.content.correctAnswer ? "text-success font-weight-bold" : "text-muted"}`}>
                      {String.fromCharCode(65 + idx)}. {option}
                      {idx === question.content.correctAnswer && " ✓ CORRECT"}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {question.type === "code_challenge" && (
              <div className="mb-2">
                <div className="d-flex justify-content-between">
                  <span><strong>Type:</strong> Code Challenge ({question.content.language})</span>
                  <span><strong>Test Cases:</strong> {question.content.testCases?.length || 0}</span>
                </div>
                {question.content.starterCode && (
                  <details className="mt-2">
                    <summary className="text-primary" style={{ cursor: "pointer" }}>
                      View Starter Code
                    </summary>
                    <pre className="bg-light p-2 mt-1 small border rounded">
                      {question.content.starterCode}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {question.type === "debug_fix" && (
              <div className="mb-2">
                <div className="d-flex justify-content-between">
                  <span><strong>Type:</strong> Debug & Fix ({question.content.language})</span>
                  {question.content.bugHint && (
                    <span className="text-info small">Has hint</span>
                  )}
                </div>
                {question.content.brokenCode && (
                  <details className="mt-2">
                    <summary className="text-primary" style={{ cursor: "pointer" }}>
                      View Broken Code
                    </summary>
                    <pre className="bg-light p-2 mt-1 small border rounded">
                      {question.content.brokenCode}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {question.content.codeSnippet && (
              <details className="mb-2">
                <summary className="text-primary" style={{ cursor: "pointer" }}>
                  <strong>View Code Snippet</strong>
                </summary>
                <pre className="bg-light p-2 mt-1 small border rounded">
                  {question.content.codeSnippet}
                </pre>
              </details>
            )}
            
            {question.tags.length > 0 && (
              <div className="mb-2">
                <strong>Tags:</strong> 
                <span className="text-muted ml-1">{question.tags.join(", ")}</span>
              </div>
            )}
            
            {question.content.explanation && (
              <div className="mb-2">
                <strong>Explanation:</strong> 
                <span className="text-muted ml-1">{question.content.explanation}</span>
              </div>
            )}

            {/* Footer info */}
            <div className="text-muted small border-top pt-2 mt-3">
              <div className="d-flex justify-content-between">
                <span>
                  <strong>Created:</strong> {new Date(question.createdAt).toLocaleDateString()} | 
                  <strong> Status:</strong> {question.status}
                </span>
                <span>
                  <strong>Category:</strong> {question.category || "Uncategorized"}
                </span>
              </div>
            </div>
          </CardText>
        </CardBody>
      </Card>

      {/* Preview Modal - Student View */}
      <Modal isOpen={showPreviewModal} toggle={() => setShowPreviewModal(false)} size="lg">
        <ModalHeader toggle={() => setShowPreviewModal(false)}>
          <div className="d-flex align-items-center">
            <span className="mr-2">Preview Question</span>
            <Badge color="info" className="mr-2">Student View</Badge>
            <Badge color={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">{question.title}</h5>
              <div className="text-muted small">
                {question.points} points • ~{Math.ceil(question.timeEstimate / 60)} min
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-3">{question.description}</p>
            
            {question.content.codeSnippet && (
              <div className="mb-3">
                <pre className="bg-light border p-3" style={{ 
                  fontSize: "13px", 
                  borderRadius: "4px",
                  overflow: "auto"
                }}>
                  <code>{question.content.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Question Type Specific Rendering */}
          {question.type === "true_false" && (
            <div className="mb-4">
              <div className="d-grid gap-2">
                <Button
                  color={previewAnswer === true ? "success" : "outline-secondary"}
                  onClick={() => setPreviewAnswer(true)}
                  className="text-left"
                >
                  True
                </Button>
                <Button
                  color={previewAnswer === false ? "success" : "outline-secondary"}
                  onClick={() => setPreviewAnswer(false)}
                  className="text-left"
                >
                  False
                </Button>
              </div>
            </div>
          )}

          {question.type === "multiple_choice" && question.content.options && (
            <div className="mb-4">
              <div className="d-grid gap-2">
                {question.content.options.map((option, index) => (
                  <Button
                    key={index}
                    color={previewAnswer === index ? "success" : "outline-secondary"}
                    onClick={() => setPreviewAnswer(index)}
                    className="text-left"
                  >
                    <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {question.type === "code_challenge" && (
            <div className="mb-4">
              <Label>Your Solution:</Label>
              <Input
                type="textarea"
                placeholder={question.content.starterCode || `// Write your ${question.content.language || 'code'} solution here\nfunction solve() {\n  // Your code here\n}`}
                rows={8}
                style={{ fontFamily: "monospace", fontSize: "13px" }}
                value={previewAnswer || ""}
                onChange={(e) => setPreviewAnswer(e.target.value)}
              />
              {question.content.testCases && question.content.testCases.length > 0 && (
                <div className="mt-2">
                  <small className="text-muted">
                    Test Cases: {question.content.testCases.filter(tc => !tc.hidden).length} visible, 
                    {question.content.testCases.filter(tc => tc.hidden).length} hidden
                  </small>
                </div>
              )}
            </div>
          )}

          {question.type === "debug_fix" && (
            <div className="mb-4">
              <Label>Fix the broken code:</Label>
              <Input
                type="textarea"
                value={previewAnswer || question.content.brokenCode || ""}
                onChange={(e) => setPreviewAnswer(e.target.value)}
                rows={8}
                style={{ fontFamily: "monospace", fontSize: "13px" }}
              />
              {question.content.bugHint && (
                <div className="mt-2">
                  <small className="text-info">
                    💡 Hint: {question.content.bugHint}
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Answer Feedback */}
          {showExplanation && (
            <Alert color="info" className="mt-3">
              <h6 className="alert-heading">
                {question.type === "true_false" ? (
                  previewAnswer === question.content.correctBoolean ? "✅ Correct!" : "❌ Incorrect"
                ) : question.type === "multiple_choice" ? (
                  previewAnswer === question.content.correctAnswer ? "✅ Correct!" : "❌ Incorrect"
                ) : (
                  "Answer Submitted"
                )}
              </h6>
              
              {question.type === "true_false" && (
                <p className="mb-1">
                  <strong>Correct Answer:</strong> {question.content.correctBoolean ? "True" : "False"}
                </p>
              )}
              
              {question.type === "multiple_choice" && question.content.options && (
                <p className="mb-1">
                  <strong>Correct Answer:</strong> {String.fromCharCode(65 + (question.content.correctAnswer || 0))}. {question.content.options[question.content.correctAnswer || 0]}
                </p>
              )}
              
              {question.content.explanation && (
                <div>
                  <strong>Explanation:</strong>
                  <p className="mb-0 mt-1">{question.content.explanation}</p>
                </div>
              )}
            </Alert>
          )}

          {question.content.hints && question.content.hints.length > 0 && !showExplanation && (
            <div className="mt-3">
              <small className="text-muted">
                💡 {question.content.hints.length} hint{question.content.hints.length !== 1 ? 's' : ''} available
              </small>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="d-flex justify-content-between w-100">
            <Button color="outline-secondary" onClick={resetPreview}>
              Reset
            </Button>
            <div>
              {!showExplanation && previewAnswer !== null && (
                <Button color="primary" onClick={handlePreviewAnswer} className="mr-2">
                  Submit Answer
                </Button>
              )}
              <Button color="secondary" onClick={() => setShowPreviewModal(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Modal>

      {/* Quick Edit Modal - Only Essential Fields */}
      <Modal isOpen={showEditModal} toggle={() => setShowEditModal(false)} size="lg">
        <ModalHeader toggle={() => setShowEditModal(false)}>
          Quick Edit: {question.title}
        </ModalHeader>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}
          
          <Form>
            <FormGroup>
              <Label for="edit-title">Question Title</Label>
              <Input
                type="text"
                id="edit-title"
                name="title"
                value={editData.title}
                onChange={handleInputChange}
              />
            </FormGroup>

            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="edit-difficulty">Difficulty</Label>
                  <Input
                    type="select"
                    id="edit-difficulty"
                    name="difficulty"
                    value={editData.difficulty}
                    onChange={handleInputChange}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="edit-points">Points</Label>
                  <Input
                    type="number"
                    id="edit-points"
                    name="points"
                    value={editData.points}
                    onChange={handleInputChange}
                    min={1}
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label for="edit-description">Question Text</Label>
              <Input
                type="textarea"
                id="edit-description"
                name="description"
                value={editData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <Label for="edit-explanation">Explanation</Label>
              <Input
                type="textarea"
                id="edit-explanation"
                name="content.explanation"
                value={editData.content.explanation || ""}
                onChange={handleInputChange}
                rows={2}
              />
            </FormGroup>

            <FormGroup>
              <Label for="edit-tags">Tags (comma-separated)</Label>
              <Input
                type="text"
                id="edit-tags"
                name="tags"
                value={editData.tags.join(", ")}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveEdit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button color="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(false)}>
        <ModalHeader toggle={() => setShowDeleteModal(false)}>
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}
          <p>Are you sure you want to delete this question?</p>
          <div className="bg-light p-3 rounded">
            <strong>{question.title}</strong>
            <br />
            <small className="text-muted">
              {formatType(question.type)} • {question.difficulty} • {question.skill}
            </small>
          </div>
          <p className="mt-2 text-muted small">
            <strong>Warning:</strong> This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Question"}
          </Button>
          <Button color="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default QuestionCard;