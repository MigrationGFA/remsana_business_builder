import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Lock, Play, Clock } from 'lucide-react';
import { Card, CardContent, Button, LinearProgress, Badge } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';

interface Module {
  id: string;
  title: string;
  days: string;
  lessonsCompleted: number;
  totalLessons: number;
  status: 'completed' | 'in_progress' | 'locked' | 'coming_soon';
  unlockDate?: string;
}

const modules: Module[] = [
  { id: '1', title: 'Business Basics', days: 'Day 1-5', lessonsCompleted: 5, totalLessons: 5, status: 'completed' },
  { id: '2', title: 'Market Research', days: 'Day 6-10', lessonsCompleted: 4, totalLessons: 5, status: 'in_progress' },
  { id: '3', title: 'Competition', days: 'Day 11-15', lessonsCompleted: 2, totalLessons: 5, status: 'in_progress' },
  { id: '4', title: 'Value Prop', days: 'Day 16-20', lessonsCompleted: 0, totalLessons: 5, status: 'locked', unlockDate: '2026-01-30' },
  { id: '5', title: 'Financial Planning', days: 'Day 21-25', lessonsCompleted: 0, totalLessons: 5, status: 'locked' },
];

export default function LearningCentrePage() {
  const navigate = useNavigate();
  const currentDay = 23;
  const totalDays = 100;
  const completionPercentage = 23;

  const getStatusBadge = (status: Module['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">✓ Completed</Badge>;
      case 'in_progress':
        return <Badge variant="primary">▶ In Progress</Badge>;
      case 'locked':
        return <Badge variant="default">🔒 Locked</Badge>;
      case 'coming_soon':
        return <Badge variant="default">🔜 Coming Soon</Badge>;
    }
  };

  const handleModuleClick = (module: Module) => {
    if (module.status === 'locked') return;
    navigate(`/lesson/${module.id}`);
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain" />
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[14px] text-[#1C1C8B] hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-[28px] font-semibold text-[#1F2121] mb-2">
            📚 Learning Centre
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[14px] text-[#6B7C7C]">
              Your Progress: Day {currentDay} of {totalDays} | {completionPercentage}% Complete
            </span>
          </div>
          <LinearProgress value={completionPercentage} className="mb-4" />
          
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button variant="primary" size="sm">All Courses</Button>
            <Button variant="secondary" size="sm">In Progress</Button>
            <Button variant="secondary" size="sm">New</Button>
          </div>
        </div>

        {/* Course Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-[20px] font-semibold text-[#1F2121] mb-2">
              📖 100-Day SME Mastery Programme
            </h3>
            <p className="text-[14px] text-[#6B7C7C]">
              Phase 1: Business Fundamentals
            </p>
          </CardContent>
        </Card>

        {/* Module List */}
        <div className="space-y-4">
          {modules.map((module) => {
            const progress = (module.lessonsCompleted / module.totalLessons) * 100;
            const isClickable = module.status !== 'locked' && module.status !== 'coming_soon';

            return (
              <Card
                key={module.id}
                variant={isClickable ? 'hoverable' : 'basic'}
                className={isClickable ? 'cursor-pointer' : 'opacity-75'}
                onClick={() => handleModuleClick(module)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📹</span>
                        <div>
                          <h4 className="text-[16px] font-semibold text-[#1F2121]">
                            {module.days}: {module.title}
                          </h4>
                          <p className="text-[12px] text-[#6B7C7C]">
                            {module.lessonsCompleted}/{module.totalLessons} lessons completed
                          </p>
                        </div>
                      </div>
                      {module.status === 'in_progress' && (
                        <div className="ml-11 mb-2">
                          <LinearProgress value={progress} className="mb-1" />
                          <p className="text-[11px] text-[#6B7C7C]">
                            Started 4 days ago
                          </p>
                        </div>
                      )}
                      {module.status === 'locked' && module.unlockDate && (
                        <div className="ml-11">
                          <p className="text-[12px] text-[#6B7C7C]">
                            Unlock in {Math.ceil((new Date(module.unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(module.status)}
                      {isClickable && (
                        <Button
                          variant={module.status === 'in_progress' ? 'primary' : 'secondary'}
                          size="sm"
                        >
                          {module.status === 'completed' ? 'Review' : 'Continue'} ➜
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button variant="secondary" size="md">
            Load More Lessons
          </Button>
        </div>
      </main>
    </div>
  );
}
