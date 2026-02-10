import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { LinearProgress } from '../components/remsana';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigate to login after splash
          setTimeout(() => navigate('/login'), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 animate-[scaleIn_0.8s_ease]">
        <div className="bg-white rounded-[16px] p-6 shadow-2xl">
          <img 
            src={remsanaIcon} 
            alt="REMSANA" 
            className="w-20 h-20 object-contain mx-auto"
          />
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-[32px] font-semibold text-white mb-2 animate-[fadeIn_0.5s_ease_0.5s_both]">
        REMSANA
      </h1>

      {/* Tagline */}
      <p className="text-[18px] text-white/90 text-center mb-8 animate-[fadeIn_0.5s_ease_0.7s_both]">
        Build Your Business
        <br />
        Level Up Your Skills
      </p>

      {/* Loading Bar */}
      <div className="w-full max-w-[300px] animate-[fadeIn_0.5s_ease_0.9s_both]">
        <LinearProgress value={progress} className="mb-2" />
        <p className="text-white/80 text-center text-[14px]">
          Loading... {progress}%
        </p>
      </div>

      {/* App Version */}
      <p className="absolute bottom-4 right-4 text-white/60 text-[12px]">
        v1.0.0
      </p>

      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
