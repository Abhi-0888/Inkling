import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, ChevronRight, CheckCircle, Star } from 'lucide-react';
import { getQuizzes, getQuizQuestions, submitQuizResponse, getUserQuizResponse, Quiz, QuizQuestion, QuizResponse } from '@/services/quizService';
import { toast } from 'sonner';

export const CompatibilityQuiz = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResponse | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    const data = await getQuizzes();
    setQuizzes(data);

    // Check which quizzes are completed
    const completed = new Set<string>();
    for (const quiz of data) {
      const response = await getUserQuizResponse(quiz.id);
      if (response) completed.add(quiz.id);
    }
    setCompletedQuizzes(completed);
    setLoading(false);
  };

  const startQuiz = async (quiz: Quiz) => {
    const existingResponse = await getUserQuizResponse(quiz.id);
    if (existingResponse) {
      setResult(existingResponse);
      setActiveQuiz(quiz);
      return;
    }

    const qs = await getQuizQuestions(quiz.id);
    if (qs.length === 0) {
      toast.error('Quiz has no questions');
      return;
    }
    
    setActiveQuiz(quiz);
    setQuestions(qs);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  };

  const handleAnswer = (optionIndex: number) => {
    const questionId = questions[currentQuestion].id;
    const newAnswers = { ...answers, [questionId]: optionIndex };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: Record<string, number>) => {
    if (!activeQuiz) return;

    const response = await submitQuizResponse(activeQuiz.id, finalAnswers);
    if (response) {
      setResult(response);
      setCompletedQuizzes(prev => new Set([...prev, activeQuiz.id]));
      toast.success('Quiz completed!');
    } else {
      toast.error('Failed to submit quiz');
    }
  };

  const resetQuiz = () => {
    setActiveQuiz(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 h-20" />
          </Card>
        ))}
      </div>
    );
  }

  // Show quiz result
  if (result && activeQuiz) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardContent className="p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
            <Star className="h-10 w-10 text-white" />
          </div>
          
          <h3 className="text-xl font-bold mb-2">{activeQuiz.title}</h3>
          
          <Badge className="mb-4 text-lg py-1 px-4">
            {result.personality_type || 'Unique'}
          </Badge>
          
          <p className="text-muted-foreground mb-6">
            Your personality type has been saved! This helps us find better matches for you.
          </p>
          
          <Button onClick={resetQuiz} variant="outline">
            Back to Quizzes
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show quiz questions
  if (activeQuiz && questions.length > 0) {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{activeQuiz.title}</h3>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>
          
          <Progress value={progress} className="mb-6" />
          
          <p className="text-lg font-medium mb-6">{question.question}</p>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => handleAnswer(index)}
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show quiz list
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Compatibility Quizzes</h2>
      </div>
      
      <p className="text-muted-foreground text-sm mb-4">
        Take quizzes to discover your personality type and improve your match compatibility!
      </p>

      {quizzes.map(quiz => (
        <Card 
          key={quiz.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => startQuiz(quiz)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{quiz.title}</h3>
                {completedQuizzes.has(quiz.id) && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              {quiz.description && (
                <p className="text-sm text-muted-foreground">{quiz.description}</p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
