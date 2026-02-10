import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent, Button, LinearProgress } from '../components/remsana';

interface Question {
  id: string;
  type: 'single' | 'multiple' | 'truefalse';
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string | string[];
}

const questions: Question[] = [
  {
    id: '1',
    type: 'single',
    question: 'What is psychological pricing?',
    options: [
      { id: 'a', text: 'Pricing based on what customers are willing to pay' },
      { id: 'b', text: 'Using price points that have psychological impact (e.g., $9.99 vs $10.00)' },
      { id: 'c', text: 'Asking customers their preferred price point' },
      { id: 'd', text: 'Matching competitor prices exactly' },
    ],
    correctAnswer: 'b',
  },
  {
    id: '2',
    type: 'single',
    question: 'What is the primary goal of market positioning?',
    options: [
      { id: 'a', text: 'To match competitor prices' },
      { id: 'b', text: 'To differentiate your business from competitors' },
      { id: 'c', text: 'To reduce production costs' },
      { id: 'd', text: 'To increase advertising budget' },
    ],
    correctAnswer: 'b',
  },
  {
    id: '3',
    type: 'single',
    question: 'How do you build perceived value?',
    options: [
      { id: 'a', text: 'Quality only' },
      { id: 'b', text: 'Multiple factors including quality, branding, customer service, and marketing' },
      { id: 'c', text: 'Lowest price in market' },
      { id: 'd', text: 'High production volume' },
    ],
    correctAnswer: 'b',
  },
  {
    id: '4',
    type: 'single',
    question: 'What should pricing reflect?',
    options: [
      { id: 'a', text: 'Only production costs' },
      { id: 'b', text: 'Product value' },
      { id: 'c', text: 'Competitor prices only' },
      { id: 'd', text: 'Market demand only' },
    ],
    correctAnswer: 'b',
  },
  {
    id: '5',
    type: 'single',
    question: 'How often should you monitor competitor pricing?',
    options: [
      { id: 'a', text: 'Once a year' },
      { id: 'b', text: 'Monthly' },
      { id: 'c', text: 'Regularly' },
      { id: 'd', text: 'Never' },
    ],
    correctAnswer: 'c',
  },
];

export default function QuizPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const selectedAnswer = answers[currentQuestion.id];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} minutes ${secs} seconds`;
  };

  const handleAnswerSelect = (answerId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answerId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / questions.length) * 100);

    // Navigate to results
    navigate(`/quiz-results/${lessonId}`, {
      state: {
        score,
        totalQuestions: questions.length,
        correctAnswers: correct,
        answers,
        questions,
        timeSpent: 600 - timeRemaining,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/lesson/${lessonId}`)}
            className="flex items-center gap-2 text-[14px] text-[#1C1C8B] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lesson
          </button>
          <button className="text-[14px] text-[#6B7C7C] hover:text-[#1C1C8B]">
            Pause Quiz
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Quiz Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-[#1F2121] mb-2">
            📝 Knowledge Check
          </h1>
          <p className="text-[14px] text-[#6B7C7C] mb-4">
            Day {lessonId}: Pricing Strategy
          </p>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] text-[#6B7C7C]">
                Progress: Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-[14px] text-[#6B7C7C]">
                {Math.round(progress)}%
              </span>
            </div>
            <LinearProgress value={progress} />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-[18px] font-semibold text-[#1F2121] mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.id}
                  className={`
                    flex items-center gap-3 p-4 border-2 rounded-[8px] cursor-pointer transition-all
                    ${selectedAnswer === option.id
                      ? 'border-[#1C1C8B] bg-[#1C1C8B]/5'
                      : 'border-[#6B7C7C]/30 hover:border-[#1C1C8B]/50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.id}
                    checked={selectedAnswer === option.id}
                    onChange={() => handleAnswerSelect(option.id)}
                    className="sr-only"
                  />
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${selectedAnswer === option.id ? 'border-[#1C1C8B]' : 'border-[#6B7C7C]/40'}
                    `}
                  >
                    {selectedAnswer === option.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1C1C8B]" />
                    )}
                  </div>
                  <span className="text-[14px] text-[#1F2121] flex-1">
                    {option.id.toUpperCase()}) {option.text}
                  </span>
                </label>
              ))}
            </div>

            {selectedAnswer && (
              <div className="mt-4 p-3 bg-[#f3f0fa] rounded-[8px]">
                <p className="text-[12px] text-[#6B7C7C]">
                  Selected: <span className="font-medium text-[#1C1C8B]">{selectedAnswer.toUpperCase()}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2 text-[14px] text-[#6B7C7C]">
            <Clock className="w-4 h-4" />
            <span>Time Remaining: {formatTime(timeRemaining)}</span>
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
            >
              Submit Quiz
            </Button>
          )}
        </div>

        {/* Info */}
        <Card>
          <CardContent className="p-4">
            <p className="text-[12px] text-[#6B7C7C]">
              ℹ You can skip questions and come back later. All answers will be submitted at the end.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
