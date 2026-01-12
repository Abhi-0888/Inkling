import { supabase } from "@/integrations/supabase/client";

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  order_index: number;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  quiz_id: string;
  answers: Record<string, number>;
  personality_type: string | null;
  completed_at: string;
}

export const getQuizzes = async (): Promise<Quiz[]> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }

  return data || [];
};

export const getQuizQuestions = async (quizId: string): Promise<QuizQuestion[]> => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index');

  if (error) {
    console.error('Error fetching quiz questions:', error);
    return [];
  }

  return (data || []).map(q => ({
    ...q,
    options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
  }));
};

export const submitQuizResponse = async (
  quizId: string,
  answers: Record<string, number>
): Promise<QuizResponse | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Calculate personality type based on answers
  const personalityType = calculatePersonalityType(answers);

  const { data, error } = await supabase
    .from('quiz_responses')
    .upsert({
      user_id: user.id,
      quiz_id: quizId,
      answers,
      personality_type: personalityType
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting quiz:', error);
    return null;
  }

  return data as QuizResponse;
};

export const getUserQuizResponse = async (quizId: string): Promise<QuizResponse | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('quiz_responses')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('user_id', user.id)
    .maybeSingle();

  return data as QuizResponse | null;
};

export const calculateCompatibility = async (otherUserId: string): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: myResponses } = await supabase
    .from('quiz_responses')
    .select('answers')
    .eq('user_id', user.id);

  const { data: theirResponses } = await supabase
    .from('quiz_responses')
    .select('answers')
    .eq('user_id', otherUserId);

  if (!myResponses?.length || !theirResponses?.length) return 50;

  // Simple compatibility calculation
  let matches = 0;
  let total = 0;

  myResponses.forEach(myResp => {
    theirResponses.forEach(theirResp => {
      const myAnswers = myResp.answers as Record<string, number>;
      const theirAnswers = theirResp.answers as Record<string, number>;
      
      Object.keys(myAnswers).forEach(key => {
        if (theirAnswers[key] !== undefined) {
          total++;
          if (myAnswers[key] === theirAnswers[key]) matches++;
        }
      });
    });
  });

  return total > 0 ? Math.round((matches / total) * 100) : 50;
};

const calculatePersonalityType = (answers: Record<string, number>): string => {
  const types = ['Romantic', 'Adventurer', 'Intellectual', 'Nurturer', 'Free Spirit'];
  const values = Object.values(answers);
  
  if (values.length === 0) return 'Explorer';
  
  const avgAnswer = values.reduce((a, b) => a + b, 0) / values.length;
  const typeIndex = Math.min(Math.floor(avgAnswer), types.length - 1);
  
  return types[typeIndex];
};
