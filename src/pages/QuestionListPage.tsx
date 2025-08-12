import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Container, 
  Button, 
  Pagination, 
  PaginationItem, 
  PaginationLink,
  Alert
} from "reactstrap";
import QuestionCard from "../components/QuestionCard";
import type { Question } from "../types";

const QuestionListPage: React.FC = () => {
  const { client } = useAuth();
  const { skill } = useParams<{ skill: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  const fetchQuestions = async (page: number = pagination.page) => {
    if (!skill) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await client.get(`/questions?page=${page}&limit=${pagination.limit}&skill=${skill}`);
      setQuestions(res.data.questions);
      setPagination(res.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch questions");
      console.error("Failed to fetch questions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(1);
  }, [client, skill]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      fetchQuestions(newPage);
    }
  };

  const handleQuestionUpdate = (updatedQuestion: Question) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q._id === updatedQuestion._id ? updatedQuestion : q
      )
    );
  };

  const handleQuestionDelete = (questionId: string) => {
    setQuestions(prevQuestions => 
      prevQuestions.filter(q => q._id !== questionId)
    );
    
    // Update pagination total
    setPagination(prev => ({ 
      ...prev, 
      total: prev.total - 1,
      pages: Math.ceil((prev.total - 1) / prev.limit)
    }));
  };

  const getSkillDisplayName = (skill: string) => {
    const skillMap: { [key: string]: string } = {
      'html': 'HTML',
      'css': 'CSS', 
      'javascript': 'JavaScript',
      'react': 'React',
      'flutter': 'Flutter',
      'react_native': 'React Native',
      'backend': 'Backend/Express',
      'python': 'Python'
    };
    return skillMap[skill] || skill;
  };

  if (loading && questions.length === 0) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading questions...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1 font-weight-bold">
            {getSkillDisplayName(skill || "")} Questions
          </h1>
          {pagination.total > 0 && (
            <p className="text-muted mb-0">
              {pagination.total} question{pagination.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        <div>
          <Button 
            color="primary" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate("/admin/question-bank/add")}
          >
            Add New Question
          </Button>
          <Button 
            color="secondary" 
            size="sm" 
            onClick={() => navigate("/admin/question-bank")}
          >
            Back to Question Bank
          </Button>
        </div>
      </div>

      {error && (
        <Alert color="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {questions.length === 0 && !loading ? (
        <div className="text-center py-5">
          <h3 className="text-muted">No questions found</h3>
          <p className="text-muted">
            No questions have been created for {getSkillDisplayName(skill || "")} yet.
          </p>
          <Button 
            color="primary" 
            onClick={() => navigate("/admin/question-bank/add")}
          >
            Create First Question
          </Button>
        </div>
      ) : (
        <>
          {/* Questions List */}
          <div className="mb-4">
            {questions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                onUpdate={handleQuestionUpdate}
                onDelete={handleQuestionDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} questions
              </div>
              
              <Pagination className="mb-0">
                <PaginationItem disabled={pagination.page === 1}>
                  <PaginationLink 
                    previous 
                    onClick={() => handlePageChange(pagination.page - 1)}
                  />
                </PaginationItem>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(pageNum => {
                    // Show first page, last page, current page, and adjacent pages
                    return pageNum === 1 || 
                           pageNum === pagination.pages || 
                           Math.abs(pageNum - pagination.page) <= 1;
                  })
                  .map((pageNum, index, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsis = index > 0 && array[index - 1] < pageNum - 1;
                    
                    return (
                      <React.Fragment key={pageNum}>
                        {showEllipsis && (
                          <PaginationItem disabled>
                            <PaginationLink>...</PaginationLink>
                          </PaginationItem>
                        )}
                        <PaginationItem active={pageNum === pagination.page}>
                          <PaginationLink onClick={() => handlePageChange(pageNum)}>
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  })}
                
                <PaginationItem disabled={pagination.page === pagination.pages}>
                  <PaginationLink 
                    next 
                    onClick={() => handlePageChange(pagination.page + 1)}
                  />
                </PaginationItem>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Loading overlay for pagination */}
      {loading && questions.length > 0 && (
        <div className="position-fixed" style={{ 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.1)', 
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="bg-white p-3 rounded shadow">
            <div className="spinner-border spinner-border-sm mr-2" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            Loading...
          </div>
        </div>
      )}
    </Container>
  );
};

export default QuestionListPage;