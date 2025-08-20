// hooks/useQuestionStats.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import { skills, getSkillCount } from '../config/skills';

interface QuestionStatsData {
  byLanguage: Array<{
    language: string;
    count: number;
    difficultyBreakdown: {
      easy: number;
      medium: number;
      hard: number;
    };
  }>;
  totals: {
    totalQuestions: number;
    difficultyBreakdown: {
      easy: number;
      medium: number;
      hard: number;
    };
    typeBreakdown: {
      multipleChoice: number;
      trueFalse: number;
      codeChallenge: number;
      codeDebugging: number;
    };
  };
}

interface UseQuestionStatsReturn {
  stats: { [key: string]: number };
  subCategoryBreakdowns: { [key: string]: { [key: string]: number } };
  totalStats: QuestionStatsData['totals'] | null;
  rawLanguageStats: QuestionStatsData['byLanguage'];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  maxCount: number; // For progress bars
}

export const useQuestionStats = (): UseQuestionStatsReturn => {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ [key: string]: number }>({});
  const [subCategoryBreakdowns, setSubCategoryBreakdowns] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [totalStats, setTotalStats] = useState<QuestionStatsData['totals'] | null>(null);
  const [rawLanguageStats, setRawLanguageStats] = useState<QuestionStatsData['byLanguage']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxCount, setMaxCount] = useState(0);

  const fetchQuestionStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('useQuestionStats: Fetching question stats for user:', {
        loginId: user.loginId,
        role: user.role,
        organizationId: user.organizationId,
        isSuperOrgAdmin: user.organization?.isSuperOrg && user.role === 'admin'
      });

      const statsResponse = await apiService.getQuestionStats();

      console.log('useQuestionStats: Stats response:', {
        error: statsResponse.error,
        status: statsResponse.status,
        message: statsResponse.message,
        data: statsResponse.data
      });

      if (statsResponse.error || !statsResponse.data) {
        throw new Error(statsResponse.message || 'Failed to fetch question statistics');
      }

      const { byLanguage, totals } = statsResponse.data;
      setRawLanguageStats(byLanguage);
      
      // Calculate skill counts using the helper function
      const skillCounts: { [key: string]: number } = {};
      const subBreakdowns: { [key: string]: { [key: string]: number } } = {};
      let maxSkillCount = 0;

      skills.forEach(skill => {
        const count = getSkillCount(skill, byLanguage);
        skillCounts[skill.skill] = count;
        maxSkillCount = Math.max(maxSkillCount, count);

        // If skill has sub-categories, build breakdown
        if (skill.subCategories) {
          subBreakdowns[skill.skill] = {};
          skill.subCategories.forEach(subCat => {
            const subStat = byLanguage.find(s => s.language === subCat);
            subBreakdowns[skill.skill][subCat] = subStat?.count || 0;
          });
        }
      });

      console.log('useQuestionStats: Processed skill counts:', skillCounts);
      console.log('useQuestionStats: Sub-category breakdowns:', subBreakdowns);
      
      setStats(skillCounts);
      setSubCategoryBreakdowns(subBreakdowns);
      setTotalStats(totals);
      setMaxCount(maxSkillCount);
    } catch (error: any) {
      console.error('Error fetching question stats:', error);
      setError(error.message || 'Failed to fetch question statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuestionStats();
    }
  }, [user]);

  return {
    stats,
    subCategoryBreakdowns,
    totalStats,
    rawLanguageStats,
    loading,
    error,
    refetch: fetchQuestionStats,
    maxCount
  };
};