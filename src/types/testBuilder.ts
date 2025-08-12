// src/types/testBuilder.ts
import type { Question } from "./questions";
import type {
  TestTemplate,
  CreateTestData as APICreateTestData,
  TestSection as APITestSection,
  SectionType,
} from "./tests"; // ✅ point to centralized types

export type { Question, TestTemplate, SectionType };

// UI-extended section type
export interface SectionWithQuestions extends APITestSection {
  _id?: string;    // from backend
  tempId?: string; // client-only
}

// UI-extended CreateTestData type
export interface CreateTestData extends Omit<APICreateTestData, "sections"> {
  sections: SectionWithQuestions[];
}

export type ActiveTab = "browse" | "create" | "sections";

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Helper to calculate totals
export const calcTotals = (data: CreateTestData, allQuestions: Question[]) => {
  const fromSection = data.settings.useSections;

  const questionsCount = fromSection
    ? data.sections.reduce((sum, s) => {
        if (s.questionPool?.enabled) {
          return sum + (s.questionPool.totalQuestions || 0);
        }
        return sum + s.questions.length;
      }, 0)
    : data.questions.length;

  const totalPoints = fromSection
    ? data.sections.reduce((sum, s) => {
        if (s.questionPool?.enabled) {
          return sum + (s.questionPool.totalQuestions || 0) * 2;
        }
        const sectionPoints = s.questions.reduce((acc, q) => {
          const found = allQuestions.find((qq) => qq._id === q.questionId);
          return acc + (found?.points ?? q.points ?? 1);
        }, 0);
        return sum + sectionPoints;
      }, 0)
    : data.questions.reduce((sum, q) => {
        const found = allQuestions.find((qq) => qq._id === q.questionId);
        return sum + (found?.points ?? q.points ?? 1);
      }, 0);

  const totalTime = fromSection
    ? data.sections.reduce((sum, s) => sum + (s.timeLimit || 0), 0)
    : data.settings.timeLimit;

  return { questionsCount, totalPoints, totalTime };
};
