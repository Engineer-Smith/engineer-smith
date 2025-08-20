// pages/SkillQuestionsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Badge,
  Alert,
  Spinner,
  Pagination,
  PaginationItem,
  PaginationLink,
  Input,
  InputGroup,
  InputGroupText,
  ButtonGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { skills } from '../config/skills';
import type { Question } from '../types';

const ITEMS_PER_PAGE = 12;

const SkillQuestionsPage: React.FC = () => {
  const { skillName } = useParams<{ skillName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [subLanguageFilter, setSubLanguageFilter] = useState<string>('all'); // For backend filtering
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Find the skill configuration
  const skill = skills.find(s => s.skill === skillName);
  
  const fetchQuestions = async (page: number = 1) => {
    if (!user || !skill) return;

    try {
      setLoading(true);
      setError(null);

      const skip = (page - 1) * ITEMS_PER_PAGE;
      const params: any = {
        limit: ITEMS_PER_PAGE,
        skip,
      };

      // Handle language filtering
      if (skill.skill === 'backend') {
        // For backend, we need to handle multiple languages
        if (subLanguageFilter === 'all') {
          // We'll need to make multiple requests and combine results
          // Or modify backend to accept multiple languages
          params.language = 'express'; // Default for now
        } else {
          params.language = subLanguageFilter;
        }
      } else {
        params.language = skill.skill;
      }

      // Add filters if not 'all'
      if (difficultyFilter !== 'all') {
        params.difficulty = difficultyFilter;
      }
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      console.log('SkillQuestionsPage: Fetching questions with params:', params);

      const response = await apiService.getAllQuestions(params);

      if (response.error || !Array.isArray(response.data)) {
        throw new Error(response.message || 'Failed to fetch questions');
      }

      setQuestions(response.data);
      
      // For total count, we'd need a separate endpoint or include it in the response
      // For now, estimate based on current results
      setTotalQuestions(response.data.length < ITEMS_PER_PAGE ? 
        skip + response.data.length : 
        skip + ITEMS_PER_PAGE + 1
      );

    } catch (error: any) {
      console.error('Error fetching questions:', error);
      setError(error.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (skill) {
      fetchQuestions(currentPage);
    }
  }, [skill, currentPage, difficultyFilter, typeFilter, subLanguageFilter]);

  // Filter questions based on search term (client-side)
  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalQuestions / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateQuestion = () => {
    navigate('/admin/question-bank/add', { 
      state: { defaultLanguage: skill?.skill === 'backend' ? 'express' : skill?.skill } 
    });
  };

  const handleEditQuestion = (questionId: string) => {
    navigate(`/admin/question-bank/edit/${questionId}`);
  };

  const handleViewQuestion = (questionId: string) => {
    navigate(`/admin/question-bank/view/${questionId}`);
  };

  const handleDeleteQuestion = (questionId: string, questionTitle: string) => {
    setQuestionToDelete({ id: questionId, title: questionTitle });
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    
    try {
      setDeleting(true);
      const response = await apiService.deleteQuestion(questionToDelete.id);
      if (response.error) {
        throw new Error(response.message || 'Failed to delete question');
      }
      
      // Close modal and reset state
      setDeleteModal(false);
      setQuestionToDelete(null);
      
      // Refresh the list
      fetchQuestions(currentPage);
    } catch (error: any) {
      alert('Error deleting question: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal(false);
    setQuestionToDelete(null);
  };

  if (!skill) {
    return (
      <Container className="py-4">
        <Alert color="warning" className="text-center">
          <strong>Skill not found:</strong> {skillName}
          <div className="mt-3">
            <Button color="primary" onClick={() => navigate('/admin/question-bank')}>
              Back to Question Bank
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (loading && questions.length === 0) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">Loading {skill.name} questions...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '20px' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container>
          <div className="py-3">
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center">
                  <Button
                    color="link"
                    className="p-0 me-3 text-muted"
                    onClick={() => navigate('/admin/question-bank')}
                  >
                    <ArrowLeft className="icon-md" />
                  </Button>
                  <div className={`p-2 rounded bg-${skill.color} bg-opacity-10 me-3`}>
                    <skill.icon className={`text-${skill.color} icon-lg`} />
                  </div>
                  <div>
                    <h1 className="h4 mb-0">{skill.name} Questions</h1>
                    <p className="text-muted mb-0 small">{skill.description}</p>
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <Button 
                  color="success" 
                  onClick={handleCreateQuestion}
                  className="d-flex align-items-center"
                >
                  <Plus className="me-2 icon-sm" />
                  Add Question
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {/* Filters and Search */}
        <Card className="border-0 shadow-sm mb-4">
          <CardBody>
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <InputGroupText>
                    <Search className="icon-sm" />
                  </InputGroupText>
                  <Input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              
              <Col md={2}>
                <Input
                  type="select"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Input>
              </Col>
              
              <Col md={2}>
                <Input
                  type="select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="multipleChoice">Multiple Choice</option>
                  <option value="trueFalse">True/False</option>
                  <option value="codeChallenge">Code Challenge</option>
                  <option value="codeDebugging">Code Debugging</option>
                </Input>
              </Col>

              {/* Sub-language filter for backend */}
              {skill.skill === 'backend' && (
                <Col md={2}>
                  <Input
                    type="select"
                    value={subLanguageFilter}
                    onChange={(e) => setSubLanguageFilter(e.target.value)}
                  >
                    <option value="all">All Languages</option>
                    <option value="express">Express</option>
                    <option value="python">Python</option>
                  </Input>
                </Col>
              )}
              
              <Col md={2}>
                <div className="text-muted small">
                  {filteredQuestions.length} questions found
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Error State */}
        {error && (
          <Alert color="danger" className="mb-4">
            <strong>Error:</strong> {error}
            <div className="mt-2">
              <Button color="primary" size="sm" onClick={() => fetchQuestions(currentPage)}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Questions Grid */}
        <Row className="g-3">
          {filteredQuestions.map((question) => (
            <Col key={question.id} md={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm">
                <CardBody className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge color={
                      question.difficulty === 'easy' ? 'success' :
                      question.difficulty === 'medium' ? 'warning' : 'danger'
                    }>
                      {question.difficulty}
                    </Badge>
                    <Badge color="light" className="text-muted">
                      {question.type.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                  </div>
                  
                  <CardTitle tag="h6" className="mb-2 text-truncate">
                    {question.title}
                  </CardTitle>
                  
                  <CardText className="text-muted small mb-3 flex-grow-1">
                    {question.description.length > 100 
                      ? question.description.substring(0, 100) + '...'
                      : question.description
                    }
                  </CardText>

                  {question.tags && question.tags.length > 0 && (
                    <div className="mb-3">
                      {question.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} color="secondary" className="me-1 mb-1 small text-white">
                          {tag}
                        </Badge>
                      ))}
                      {question.tags.length > 3 && (
                        <Badge color="secondary" className="small text-white">
                          +{question.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <small className="text-muted">
                      {question.language}
                    </small>
                    
                    <ButtonGroup size="sm">
                      <Button
                        color="outline-primary"
                        onClick={() => handleViewQuestion(question.id)}
                      >
                        <Eye className="icon-xs" />
                      </Button>
                      <Button
                        color="outline-secondary"
                        onClick={() => handleEditQuestion(question.id)}
                      >
                        <Edit className="icon-xs" />
                      </Button>
                      <Button
                        color="outline-danger"
                        onClick={() => handleDeleteQuestion(question.id, question.title)}
                      >
                        <Trash2 className="icon-xs" />
                      </Button>
                    </ButtonGroup>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Empty State */}
        {filteredQuestions.length === 0 && !loading && (
          <Card className="border-0 shadow-sm text-center py-5">
            <CardBody>
              <skill.icon className={`text-${skill.color} mb-3`} size={48} />
              <h5>No {skill.name} questions found</h5>
              <p className="text-muted mb-4">
                {searchTerm || difficultyFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : `Start building your ${skill.name} question bank.`
                }
              </p>
              <Button color="success" onClick={handleCreateQuestion}>
                <Plus className="me-2 icon-sm" />
                Create First Question
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <PaginationItem disabled={currentPage === 1}>
                <PaginationLink 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="d-flex align-items-center"
                >
                  <ChevronLeft className="icon-sm" />
                </PaginationLink>
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <PaginationItem key={page} active={page === currentPage}>
                    <PaginationLink onClick={() => handlePageChange(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem disabled={currentPage === totalPages}>
                <PaginationLink 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="d-flex align-items-center"
                >
                  <ChevronRight className="icon-sm" />
                </PaginationLink>
              </PaginationItem>
            </Pagination>
          </div>
        )}

        {/* Loading overlay for pagination */}
        {loading && questions.length > 0 && (
          <div className="text-center mt-3">
            <Spinner color="primary" size="sm" className="me-2" />
            <small className="text-muted">Loading...</small>
          </div>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={cancelDelete} centered>
        <ModalHeader toggle={cancelDelete} className="border-0 pb-0">
          <div className="d-flex align-items-center">
            <div className="p-2 rounded bg-danger bg-opacity-10 me-3">
              <AlertTriangle className="text-danger icon-md" />
            </div>
            <div>
              <h5 className="mb-0">Delete Question</h5>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pt-2">
          <p className="mb-3">
            Are you sure you want to delete the question:
          </p>
          <div className="p-3 bg-light rounded mb-3">
            <strong>"{questionToDelete?.title}"</strong>
          </div>
          <div className="d-flex align-items-start">
            <AlertTriangle className="text-warning me-2 mt-1 icon-sm flex-shrink-0" />
            <small className="text-muted">
              This action cannot be undone. The question will be permanently removed from the question bank.
            </small>
          </div>
        </ModalBody>
        <ModalFooter className="border-0 pt-0">
          <Button 
            color="secondary" 
            onClick={cancelDelete}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            color="danger" 
            onClick={confirmDelete}
            disabled={deleting}
            className="d-flex align-items-center"
          >
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="me-2 icon-sm" />
                Delete Question
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SkillQuestionsPage;