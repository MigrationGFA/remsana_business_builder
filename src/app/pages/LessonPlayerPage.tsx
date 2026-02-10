import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Play, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';

export default function LessonPlayerPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const lesson = {
    id: lessonId || '23',
    day: 23,
    title: 'Pricing Strategy & Positioning',
    duration: '12 minutes 45 seconds',
    durationSeconds: 765,
    videoUrl: 'https://example.com/video.mp4',
    overview: [
      'How to determine the right price for your products/services',
      'Competitive pricing strategies',
      'Psychological pricing techniques',
      'Market positioning and differentiation',
      'Building perceived value',
    ],
    keyTakeaways: [
      'Price should reflect product value',
      'Monitor competitor pricing regularly',
      'Psychological pricing increases conversions',
      'Positioning differentiates you from competitors',
    ],
    resources: [
      { id: '1', name: 'Pricing Strategy Workbook', format: 'PDF', size: '523 KB', url: '/resources/pricing-workbook.pdf' },
      { id: '2', name: 'Pricing Calculator Template', format: 'Excel', size: '234 KB', url: '/resources/pricing-calculator.xlsx' },
    ],
    hasQuiz: true,
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/learning')}
            className="flex items-center gap-2 text-[14px] text-[#1C1C8B] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lessons
          </button>
          <div className="flex items-center gap-3">
            <button className="text-[14px] text-[#6B7C7C] hover:text-[#1C1C8B]">
              Full Screen
            </button>
            <button className="text-[14px] text-[#6B7C7C] hover:text-[#1C1C8B]">
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Video Player */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="relative bg-black aspect-video flex items-center justify-center">
              {!videoPlaying ? (
                <button
                  onClick={() => setVideoPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-[#1C1C8B] ml-1" fill="#1C1C8B" />
                  </div>
                </button>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <p className="text-[14px] mb-2">Video Player</p>
                    <p className="text-[12px] text-white/70">Video would play here</p>
                  </div>
                </div>
              )}
            </div>
            {videoPlaying && (
              <div className="p-4 bg-[#1F2121] text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <button className="hover:opacity-70">
                      <Play className="w-5 h-5" />
                    </button>
                    <span className="text-[12px]">0:00</span>
                    <div className="flex-1 h-1 bg-white/30 rounded-full">
                      <div className="h-full bg-white w-[35%] rounded-full"></div>
                    </div>
                    <span className="text-[12px]">{lesson.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-[12px] hover:opacity-70">1.0x</button>
                    <button className="text-[12px] hover:opacity-70">CC</button>
                    <button className="text-[12px] hover:opacity-70">⛶</button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lesson Info */}
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-[#1F2121] mb-2">
            Day {lesson.day}: {lesson.title}
          </h1>
          <p className="text-[14px] text-[#6B7C7C]">
            Duration: {lesson.duration}
          </p>
        </div>

        {/* Lesson Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">
              📋 Lesson Overview
            </h3>
            <p className="text-[14px] text-[#6B7C7C] mb-4">
              In this lesson, you'll learn:
            </p>
            <ul className="space-y-2">
              {lesson.overview.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[14px] text-[#1F2121]">
                  <span className="text-[#1C1C8B] mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Key Takeaways */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">
              📚 Key Takeaways
            </h3>
            <div className="space-y-3">
              {lesson.keyTakeaways.map((takeaway, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#218D8D] flex-shrink-0 mt-0.5" />
                  <span className="text-[14px] text-[#1F2121]">{takeaway}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Downloadable Resources */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">
              📥 Downloadable Resources
            </h3>
            <div className="space-y-3">
              {lesson.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-4 bg-[#f3f0fa] rounded-[8px]"
                >
                  <div>
                    <h4 className="text-[14px] font-semibold text-[#1F2121] mb-1">
                      {resource.name}
                    </h4>
                    <p className="text-[12px] text-[#6B7C7C]">
                      {resource.format} • {resource.size}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download {resource.format}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiz CTA */}
        {lesson.hasQuiz && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-[18px] font-semibold text-[#1F2121] mb-2">
                ✋ Ready for Quiz?
              </h3>
              <p className="text-[14px] text-[#6B7C7C] mb-4">
                Test your knowledge on the concepts covered in this lesson.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate(`/quiz/${lesson.id}`)}
                >
                  ✎ Take Quiz
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/learning')}
                >
                  Skip for Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
