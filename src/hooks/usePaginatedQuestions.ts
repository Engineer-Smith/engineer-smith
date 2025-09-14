// hooks/usePaginatedQuestions.ts - FIXED: Use proper pagination API with explicit types
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import type { Question } from '../types';

interface PaginationFilters {
  language?: string;
  difficulty?: string;
  type?: string;
  search?: string;
}

interface UsePaginatedQuestionsOptions {
  itemsPerPage?: number;
  initialFilters?: PaginationFilters;
}

interface UsePaginatedQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters: PaginationFilters;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<PaginationFilters>) => void;
  refetch: () => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
}

export const usePaginatedQuestions = (
  options: UsePaginatedQuestionsOptions = {}
): UsePaginatedQuestionsReturn => {
  const { itemsPerPage = 12, initialFilters = {} } = options;
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFiltersState] = useState<PaginationFilters>(initialFilters);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const fetchQuestions = useCallback(async (page: number = currentPage) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const skip = (page - 1) * itemsPerPage;
      const params: any = {
        limit: itemsPerPage,
        skip,
      };

      // Apply filters
      if (filters.language) params.language = filters.language;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.type) params.type = filters.type;

      console.log('usePaginatedQuestions: Fetching with params:', params);

      // FIXED: Use the proper pagination API that returns totalCount and totalPages
      const response = await apiService.getPaginatedQuestions(params);

      if (response.error || !response.data) {
        throw new Error(response.message || 'Failed to fetch questions');
      }

      let questionsData = response.data.questions;
      const totalCount = response.data.totalCount;
      const totalPagesFromAPI = response.data.totalPages;

      // Apply client-side search filter if provided
      if (filters.search) {
        // FIXED: Explicitly type the filter callback parameters
        questionsData = questionsData.filter((question: Question) =>
          question.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
          question.description.toLowerCase().includes(filters.search!.toLowerCase()) ||
          (question.tags && question.tags.some((tag: string) => 
            tag.toLowerCase().includes(filters.search!.toLowerCase())
          ))
        );
        
        // FIXED: Recalculate totals for filtered results
        setTotalItems(questionsData.length);
        setTotalPages(Math.ceil(questionsData.length / itemsPerPage));
      } else {
        setTotalItems(totalCount);
        setTotalPages(totalPagesFromAPI);
      }

      setQuestions(questionsData);

    } catch (error: any) {
      console.error('Error fetching questions:', error);
      setError(error.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, itemsPerPage, filters]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchQuestions(currentPage);
  }, [fetchQuestions]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchQuestions(1);
    }
  }, [filters.language, filters.difficulty, filters.type]);

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const setFilters = (newFilters: Partial<PaginationFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const nextPage = () => {
    if (hasNextPage) setPage(currentPage + 1);
  };

  const prevPage = () => {
    if (hasPrevPage) setPage(currentPage - 1);
  };

  const refetch = () => fetchQuestions(currentPage);

  return {
    questions,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPrevPage,
    filters,
    setPage,
    setFilters,
    refetch,
    nextPage,
    prevPage,
  };
};