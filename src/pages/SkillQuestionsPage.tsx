// pages/SkillQuestionsPage.tsx - Clean build with language-based filtering and status filter
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
  AlertTriangle,
  Code,
  CheckSquare,
  Bug,
  List,
  SquareDashed,
  TestTube,
  FileText,
  Layers
} from 'lucide-react';
import { skills } from '../config/skills';
import type { Question, QuestionType, QuestionCategory } from '../types';
import {
  getQuestionTypesForLanguage,
  getCategoriesForLanguage,
  getSupportedTypeCount
} from '../utils/languageQuestionTypes';

const ITEMS_PER_PAGE = 12;

// Type configurations with icons and descriptions
const QUESTION_TYPE_CONFIGS = {
  multipleChoice: {
    label: 'Multiple Choice',
    icon: List,
    color: 'primary',
    description: 'Choose from multiple options'
  },
  trueFalse: {
    label: 'True/False',
    icon: CheckSquare,
    color: 'info',
    description: 'True or false answer'
  },
  fillInTheBlank: {
    label: 'Fill in the Blank',
    icon: SquareDashed,
    color: 'success',
    description: 'Complete missing code parts'
  },
  codeChallenge: {
    label: 'Code Challenge',
    icon: Code,
    color: 'warning',
    description: 'Write code to solve problems'
  },
  codeDebugging: {
    label: 'Code Debugging',
    icon: Bug,
    color: 'danger',
    description: 'Find and fix code bugs'
  }
} as const;

const CATEGORY_CONFIGS = {
  logic: { label: 'Logic', color: 'primary', description: 'Algorithmic thinking' },
  ui: { label: 'UI', color: 'success', description: 'User interface design' },
  syntax: { label: 'Syntax', color: 'info', description: 'Language syntax rules' }
} as const;

const STATUS_CONFIGS = {
  draft: { label: 'Draft', color: 'secondary', description: 'Work in progress' },
  active: { label: 'Active', color: 'success', description: 'Ready for use' },
  archived: { label: 'Archived', color: 'warning', description: 'No longer active' }
} as const;

const SkillQuestionsPage: React.FC = () => {
  const { skillName } = useParams<{ skillName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subLanguageFilter, setSubLanguageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Find skill configuration
  const skill = skills.find(s => s.skill === skillName);

  // Get current effective language
  const getCurrentLanguage = () => {
    if (!skill) return 'javascript';

    if (skill.subCategories) {
      return subLanguageFilter === 'all' ? skill.subCategories[0] : subLanguageFilter;
    }
    return skill.skill;
  };

  // Get available options for current language
  const getAvailableQuestionTypes = () => {
    const currentLang = getCurrentLanguage();
    return getQuestionTypesForLanguage(currentLang as any);
  };

  const getAvailableCategories = () => {
    const currentLang = getCurrentLanguage();
    return getCategoriesForLanguage(currentLang as any);
  };

  // Reset filters when language changes
  useEffect(() => {
    const availableTypes = getAvailableQuestionTypes();
    const availableCategories = getAvailableCategories();

    // Reset type filter if current selection is not available
    if (typeFilter !== 'all' && !availableTypes.includes(typeFilter as QuestionType)) {
      setTypeFilter('all');
    }

    // Reset category filter if current selection is not available
    if (categoryFilter !== 'all' && !availableCategories.includes(categoryFilter as QuestionCategory)) {
      setCategoryFilter('all');
    }
  }, [subLanguageFilter, typeFilter, categoryFilter]);

  // Fetch questions
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
      if (skill.subCategories) {
        if (subLanguageFilter === 'all') {
          params.language = skill.subCategories.join(',');
        } else {
          params.language = subLanguageFilter;
        }
      } else {
        params.language = skill.skill;
      }

      // Add filters
      if (difficultyFilter !== 'all') params.difficulty = difficultyFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      // FIXED: getAllQuestions with includeTotalCount returns object or array directly
      const response = await apiService.getAllQuestions(params, true);

      // FIXED: No error property, response IS the data
      if (!response) {
        setQuestions([]);
        setTotalQuestions(0);
        return;
      }

      // Handle response format - can be array or object with pagination info
      if (Array.isArray(response)) {
        setQuestions(response);
        setTotalQuestions(response.length);
      } else {
        // Response is paginated object: { questions: Question[], totalCount: number, totalPages: number }
        setQuestions(response.questions || []);
        setTotalQuestions(response.totalCount || 0);
      }

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
  }, [skill, currentPage, difficultyFilter, typeFilter, categoryFilter, subLanguageFilter, statusFilter]);

  // Client-side search filtering
  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (question.tags && question.tags.some(tag =>
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const totalPages = Math.ceil(totalQuestions / ITEMS_PER_PAGE);

  // Event handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateQuestion = () => {
    const defaultLanguage = skill?.subCategories ? skill.subCategories[0] : skill?.skill;
    navigate('/admin/question-bank/add', {
      state: { defaultLanguage }
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
      // FIXED: deleteQuestion returns { message: string } directly
      const response = await apiService.deleteQuestion(questionToDelete.id);

      // FIXED: No error property, response IS the success object
      if (!response || !response.message) {
        throw new Error('Failed to delete question');
      }

      setDeleteModal(false);
      setQuestionToDelete(null);
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

  const clearAllFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
    setSubLanguageFilter('all');
    setStatusFilter('active');
  };

  // Get type-specific info for display
  const getTypeSpecificInfo = (question: Question) => {
    switch (question.type) {
      case 'codeChallenge':
      case 'codeDebugging':
        if (question.category === 'logic' && question.testCases) {
          return {
            icon: TestTube,
            text: `${question.testCases.length} test cases`,
            color: 'info'
          };
        }
        break;
      case 'fillInTheBlank':
        if (question.blanks) {
          return {
            icon: SquareDashed,
            text: `${question.blanks.length} blanks`,
            color: 'success'
          };
        }
        break;
      case 'multipleChoice':
        if (question.options) {
          return {
            icon: List,
            text: `${question.options.length} options`,
            color: 'primary'
          };
        }
        break;
      case 'codeDebugging':
        if (question.buggyCode) {
          return {
            icon: Bug,
            text: 'Has buggy code',
            color: 'warning'
          };
        }
        break;
    }
    return null;
  };

  // Get filtered options
  const availableQuestionTypes = getAvailableQuestionTypes();
  const availableCategories = getAvailableCategories();

  // Loading and error states
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
        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <CardBody>
            {/* First Row - Search and Main Filters */}
            <Row className="g-3 mb-3">
              {/* Search */}
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

              {/* Status Filter */}
              <Col md={2}>
                <Input
                  type="select"
                  value={statusFilter}
                  onChange={(e) => {
                    console.log('Status filter changed to:', e.target.value);
                    setStatusFilter(e.target.value);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </Input>
              </Col>

              {/* Difficulty */}
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

              {/* Question Type - Filtered by Language */}
              <Col md={2}>
                <Input
                  type="select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  title={`Available types for ${getCurrentLanguage()}`}
                >
                  <option value="all">All Types</option>
                  {availableQuestionTypes.map(type => {
                    const config = QUESTION_TYPE_CONFIGS[type];
                    return (
                      <option key={type} value={type}>
                        {config?.label || type}
                      </option>
                    );
                  })}
                </Input>
              </Col>

              {/* Category - Filtered by Language */}
              <Col md={2}>
                <Input
                  type="select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map(category => {
                    const config = CATEGORY_CONFIGS[category as keyof typeof CATEGORY_CONFIGS];
                    return (
                      <option key={category} value={category}>
                        {config?.label || category}
                      </option>
                    );
                  })}
                </Input>
              </Col>
            </Row>

            {/* Second Row - Additional Filters */}
            <Row className="g-3 align-items-center">
              {/* Sub-language filter for combined skills */}
              {skill.subCategories && (
                <Col md={3}>
                  <div>
                    <label className="form-label small text-muted mb-1">Language</label>
                    <Input
                      type="select"
                      value={subLanguageFilter}
                      onChange={(e) => setSubLanguageFilter(e.target.value)}
                      bsSize="sm"
                    >
                      <option value="all">All Languages</option>
                      {skill.subCategories.map(lang => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </Input>
                  </div>
                </Col>
              )}

              {/* Clear Filters Button */}
              <Col md={3}>
                <Button
                  color="outline-secondary"
                  size="sm"
                  onClick={clearAllFilters}
                  className="d-flex align-items-center"
                >
                  Clear All Filters
                </Button>
              </Col>

              {/* Results count and current filters */}
              <Col md={6} className="text-end">
                <div className="d-flex justify-content-end align-items-center gap-3">
                  <div className="text-muted small">
                    <strong>{filteredQuestions.length}</strong> questions found
                  </div>

                  {/* Active filter badges */}
                  <div className="d-flex gap-1 flex-wrap">
                    {statusFilter !== 'all' && (
                      <Badge color="info" className="small">
                        Status: {statusFilter}
                      </Badge>
                    )}
                    {difficultyFilter !== 'all' && (
                      <Badge color="info" className="small">
                        {difficultyFilter}
                      </Badge>
                    )}
                    {typeFilter !== 'all' && (
                      <Badge color="info" className="small">
                        {QUESTION_TYPE_CONFIGS[typeFilter as keyof typeof QUESTION_TYPE_CONFIGS]?.label || typeFilter}
                      </Badge>
                    )}
                    {categoryFilter !== 'all' && (
                      <Badge color="info" className="small">
                        {CATEGORY_CONFIGS[categoryFilter as keyof typeof CATEGORY_CONFIGS]?.label || categoryFilter}
                      </Badge>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            {/* Language-specific info */}
            {availableQuestionTypes.length < 5 && (
              <Row className="mt-2">
                <Col>
                  <small className="text-muted">
                    <strong>{getCurrentLanguage()}:</strong> Supports {getSupportedTypeCount(getCurrentLanguage() as any)} question types: {' '}
                    {availableQuestionTypes.map(type => QUESTION_TYPE_CONFIGS[type]?.label || type).join(', ')}
                  </small>
                </Col>
              </Row>
            )}
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
          {filteredQuestions.map((question) => {
            const typeConfig = QUESTION_TYPE_CONFIGS[question.type];
            const categoryConfig = question.category ? CATEGORY_CONFIGS[question.category] : null;
            const statusConfig = STATUS_CONFIGS[question.status];
            const typeInfo = getTypeSpecificInfo(question);
            const TypeIcon = typeConfig?.icon || FileText;

            return (
              <Col key={question._id} md={6} lg={4}>
                <Card className="h-100 border-0 shadow-sm hover-shadow">
                  <CardBody className="d-flex flex-column">
                    {/* Header badges */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex gap-1 flex-wrap">
                        <Badge color={
                          question.difficulty === 'easy' ? 'success' :
                            question.difficulty === 'medium' ? 'warning' : 'danger'
                        }>
                          {question.difficulty}
                        </Badge>
                        {categoryConfig && (
                          <Badge color={categoryConfig.color} outline>
                            {categoryConfig.label}
                          </Badge>
                        )}
                        <Badge color={statusConfig.color} outline>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <Badge color={typeConfig?.color || 'secondary'} className="d-flex align-items-center">
                        <TypeIcon size={12} className="me-1" />
                        {typeConfig?.label || question.type}
                      </Badge>
                    </div>

                    {/* Title */}
                    <CardTitle tag="h6" className="mb-2 text-truncate" title={question.title}>
                      {question.title}
                    </CardTitle>

                    {/* Description */}
                    <CardText className="text-muted small mb-3 flex-grow-1">
                      {question.description.length > 120
                        ? question.description.substring(0, 120) + '...'
                        : question.description
                      }
                    </CardText>

                    {/* Type-specific info */}
                    {typeInfo && (
                      <div className="mb-2">
                        <Badge color={typeInfo.color} outline className="d-flex align-items-center w-fit">
                          <typeInfo.icon size={12} className="me-1" />
                          {typeInfo.text}
                        </Badge>
                      </div>
                    )}

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 && (
                      <div className="mb-3">
                        {question.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} color="secondary" className="me-1 mb-1 small" style={{ fontSize: '0.7rem' }}>
                            {tag}
                          </Badge>
                        ))}
                        {question.tags.length > 3 && (
                          <Badge color="secondary" className="small" style={{ fontSize: '0.7rem' }}>
                            +{question.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <small className="text-muted d-flex align-items-center">
                        <Layers size={12} className="me-1" />
                        {question.language}
                      </small>

                      <ButtonGroup size="sm">
                        <Button
                          color="outline-primary"
                          onClick={() => handleViewQuestion(question._id)}
                          title="View Question"
                        >
                          <Eye className="icon-xs" />
                        </Button>
                        <Button
                          color="outline-secondary"
                          onClick={() => handleEditQuestion(question._id)}
                          title="Edit Question"
                        >
                          <Edit className="icon-xs" />
                        </Button>
                        <Button
                          color="outline-danger"
                          onClick={() => handleDeleteQuestion(question._id, question.title)}
                          title="Delete Question"
                        >
                          <Trash2 className="icon-xs" />
                        </Button>
                      </ButtonGroup>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Empty State */}
        {filteredQuestions.length === 0 && !loading && (
          <Card className="border-0 shadow-sm text-center py-5">
            <CardBody>
              <skill.icon className={`text-${skill.color} mb-3`} size={48} />
              <h5>No {skill.name} questions found</h5>
              <p className="text-muted mb-4">
                {searchTerm || difficultyFilter !== 'all' || typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : `Start building your ${skill.name} question bank with various question types.`
                }
              </p>
              {(searchTerm || difficultyFilter !== 'all' || typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  color="outline-secondary"
                  className="me-2"
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </Button>
              )}
              <Button color="success" onClick={handleCreateQuestion}>
                <Plus className="me-2 icon-sm" />
                Create Question
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

        {/* Loading overlay */}
        {loading && questions.length > 0 && (
          <div className="text-center mt-3">
            <Spinner color="primary" size="sm" className="me-2" />
            <small className="text-muted">Loading...</small>
          </div>
        )}
      </Container>

      {/* Delete Modal */}
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
            Are you sure you want to delete this question?
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

      {/* Styles */}
      <style>{`
        .hover-shadow {
          transition: all 0.2s ease-in-out;
        }
        .hover-shadow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .w-fit {
          width: fit-content !important;
        }
        .icon-xs { width: 12px; height: 12px; }
        .icon-sm { width: 16px; height: 16px; }
        .icon-md { width: 20px; height: 20px; }
        .icon-lg { width: 24px; height: 24px; }
      `}</style>
    </div>
  );
};

export default SkillQuestionsPage;