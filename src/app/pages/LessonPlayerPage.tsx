import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Play } from 'lucide-react';
import { Card, CardContent, Button } from '../components/remsana';
import { getLesson, recordLessonView, recordVideoProgress } from '../api/learningApi';
import type { LearningLesson } from '../api/learningApi';

function formatDuration(sec?: number): string {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} minute${m !== 1 ? 's' : ''} ${s} second${s !== 1 ? 's' : ''}`;
}

export default function LessonPlayerPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<LearningLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      setError('No lesson selected');
      return;
    }
    getLesson(lessonId)
      .then((data) => {
        setLesson(data);
        if (data) recordLessonView(lessonId);
      })
      .catch((err) => {
        console.error('Failed to load lesson:', err);
        setError('Failed to load lesson.');
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleVideoProgress = () => {
    if (lessonId && lesson?.duration_sec) {
      recordVideoProgress(lessonId, lesson.duration_sec, lesson.duration_sec);
    }
  };

  const overviewLines = lesson?.overview
    ? lesson.overview.split('\n').filter((s) => s.trim())
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
        <p className="text-[14px] text-[#6B7C7C]">Loading lesson...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-[14px] text-[#6B7C7C] mb-4">{error ?? 'Lesson not found.'}</p>
            <Button variant="primary" onClick={() => navigate('/learning')}>
              Back to Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const duration = formatDuration(lesson.duration_sec);

  return (
    <div className="min-h-screen bg-[#f3f0fa]">
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
            <button className="text-[14px] text-[#6B7C7C] hover:text-[#1C1C8B]">Full Screen</button>
            <button className="text-[14px] text-[#6B7C7C] hover:text-[#1C1C8B]">⚙️</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
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
                  {lesson.video_url ? (
                    <video
                      src={lesson.video_url}
                      controls
                      className="w-full h-full"
                      onEnded={handleVideoProgress}
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-[14px] mb-2">Video Player</p>
                      <p className="text-[12px] text-white/70">Video URL would play here</p>
                    </div>
                  )}
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
                    <span className="text-[12px]">{duration}</span>
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

        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-[#1F2121] mb-2">
            Day {lesson.day_number}: {lesson.title}
          </h1>
          <p className="text-[14px] text-[#6B7C7C]">Duration: {duration}</p>
        </div>

        {overviewLines.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">📋 Lesson Overview</h3>
              <p className="text-[14px] text-[#6B7C7C] mb-4">In this lesson, you'll learn:</p>
              <ul className="space-y-2">
                {overviewLines.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[14px] text-[#1F2121]">
                    <span className="text-[#1C1C8B] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {lesson.resources && lesson.resources.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-[18px] font-semibold text-[#1F2121] mb-4">📥 Downloadable Resources</h3>
              <div className="space-y-3">
                {lesson.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-4 bg-[#f3f0fa] rounded-[8px]"
                  >
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#1F2121] mb-1">{resource.name}</h4>
                      <p className="text-[12px] text-[#6B7C7C]">
                        {resource.format ?? 'File'} • {resource.file_size ? `${Math.round(resource.file_size / 1024)} KB` : ''}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => resource.file_url && window.open(resource.file_url, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {resource.format ?? 'File'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {lesson.has_quiz && lesson.quiz && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-[18px] font-semibold text-[#1F2121] mb-2">✋ Ready for Quiz?</h3>
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
                <Button variant="secondary" size="lg" onClick={() => navigate('/learning')}>
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
