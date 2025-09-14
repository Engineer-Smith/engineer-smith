// src/utils/languageQuestionTypes.ts - Centralized mapping of language to question types

import type { Language, QuestionType, QuestionCategory } from '../types';

/**
 * Define supported question types for each language
 * Based on actual backend support - ONLY the 12 languages your backend supports
 */
export const LANGUAGE_QUESTION_TYPES: Record<string, QuestionType[]> = {
  // Programming languages with full logic support
  javascript: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging'],
  typescript: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging'],
  python: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging'],
  sql: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging'],
  dart: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging'],
  express: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging'],
  
  // Frontend frameworks with UI support
  react: ['multipleChoice', 'trueFalse', 'fillInTheBlank'],
  reactNative: ['multipleChoice', 'trueFalse', 'fillInTheBlank'],
  flutter: ['multipleChoice', 'trueFalse', 'fillInTheBlank'],
  
  // UI languages - no code execution
  html: ['multipleChoice', 'trueFalse', 'fillInTheBlank'],
  css: ['multipleChoice', 'trueFalse', 'fillInTheBlank'],
  
  // Configuration - only syntax
  json: ['multipleChoice', 'trueFalse', 'fillInTheBlank'],
  
  // Default fallback
  default: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging']
};

/**
 * Define supported categories for each language
 * Matches backend VALID_COMBINATIONS exactly
 */
export const LANGUAGE_CATEGORIES: Record<string, QuestionCategory[]> = {
  // UI languages
  html: ['ui', 'syntax'],
  css: ['ui', 'syntax'],
  react: ['ui', 'syntax'],
  flutter: ['ui', 'syntax'],
  reactNative: ['ui', 'syntax'],
  
  // Logic languages
  javascript: ['logic', 'syntax'],
  typescript: ['logic', 'syntax'],
  python: ['logic', 'syntax'],
  sql: ['logic', 'syntax'],
  dart: ['logic', 'syntax'],
  express: ['logic', 'syntax'],
  
  // Configuration only
  json: ['syntax'],
  
  // Default fallback
  default: ['logic', 'ui', 'syntax']
};

/**
 * Get supported question types for a specific language
 */
export const getQuestionTypesForLanguage = (language: Language): QuestionType[] => {
  return LANGUAGE_QUESTION_TYPES[language] || LANGUAGE_QUESTION_TYPES.default;
};

/**
 * Get supported categories for a specific language
 */
export const getCategoriesForLanguage = (language: Language): QuestionCategory[] => {
  return LANGUAGE_CATEGORIES[language] || LANGUAGE_CATEGORIES.default;
};

/**
 * Check if a question type is supported for a language
 */
export const isQuestionTypeSupported = (language: Language, questionType: QuestionType): boolean => {
  const supportedTypes = getQuestionTypesForLanguage(language);
  return supportedTypes.includes(questionType);
};

/**
 * Check if a category is supported for a language
 */
export const isCategorySupported = (language: Language, category: QuestionCategory): boolean => {
  const supportedCategories = getCategoriesForLanguage(language);
  return supportedCategories.includes(category);
};

/**
 * Get count of supported question types for a language (for UI display)
 */
export const getSupportedTypeCount = (language: Language): number => {
  return getQuestionTypesForLanguage(language).length;
};

/**
 * Get the reason why a question type is not supported (for UI feedback)
 */
export const getUnsupportedReason = (language: Language, questionType: QuestionType): string | null => {
  if (isQuestionTypeSupported(language, questionType)) {
    return null;
  }

  // Simple reasons based on your backend structure
  if (questionType === 'codeChallenge' || questionType === 'codeDebugging') {
    if (['html', 'css', 'react', 'reactNative', 'flutter', 'json'].includes(language)) {
      return `${language.toUpperCase()} questions use Fill-in-the-Blank instead of code execution.`;
    }
  }

  return `Question type '${questionType}' is not supported for ${language}`;
};

/**
 * Get languages that support a specific question type
 */
export const getLanguagesSupportingType = (questionType: QuestionType): Language[] => {
  const supportingLanguages: Language[] = [];
  
  for (const [language, types] of Object.entries(LANGUAGE_QUESTION_TYPES)) {
    if (language !== 'default' && types.includes(questionType)) {
      supportingLanguages.push(language as Language);
    }
  }
  
  return supportingLanguages;
};

/**
 * Get comprehensive support matrix for admin/debug purposes
 */
export const getLanguageQuestionTypeMatrix = () => {
  const allTypes: QuestionType[] = ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging'];
  const matrix: Record<string, Record<QuestionType, boolean>> = {};

  for (const [language, supportedTypes] of Object.entries(LANGUAGE_QUESTION_TYPES)) {
    if (language === 'default') continue;
    
    matrix[language] = allTypes.reduce((acc, type) => {
      acc[type] = supportedTypes.includes(type);
      return acc;
    }, {} as Record<QuestionType, boolean>);
  }

  return matrix;
};