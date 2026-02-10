import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BarChart3 } from 'lucide-react';
import { Button, Card, CardContent } from '../../components/remsana';
import remsanaIcon from '../../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import type { InsiderRole } from '../../api/insider/types';

export default function InsiderPortalPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<InsiderRole | null>(null);

  const handleContinue = () => {
    if (role) navigate('/insider/login', { state: { role } });
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa] flex flex-col">
      <header className="bg-white shadow-sm py-4 px-4 md:px-8">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <img src={remsanaIcon} alt="REMSANA" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F2121]">REMSANA /INSIDER</h1>
            <p className="text-[12px] text-[#6B7C7C]">Admin Portal</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-[420px]">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-[22px] font-semibold text-[#1F2121] mb-1">
              SELECT YOUR ROLE
            </h2>
            <p className="text-[14px] text-[#6B7C7C] mb-6">
              Choose the role that matches your access level.
            </p>

            <div className="space-y-3 mb-6">
              <label
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  role === 'ADMIN' ? 'border-[#1C1C8B] bg-[#f3f0fa]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={role === 'ADMIN'}
                  onChange={() => setRole('ADMIN')}
                  className="sr-only"
                />
                <Shield className="w-5 h-5 text-[#1C1C8B]" />
                <span className="font-medium text-[#1F2121]">Full Administrator</span>
              </label>
              <label
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  role === 'ANALYST' ? 'border-[#1C1C8B] bg-[#f3f0fa]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="ANALYST"
                  checked={role === 'ANALYST'}
                  onChange={() => setRole('ANALYST')}
                  className="sr-only"
                />
                <BarChart3 className="w-5 h-5 text-[#1C1C8B]" />
                <span className="font-medium text-[#1F2121]">Analyst</span>
              </label>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!role}
              className="w-full"
            >
              CONTINUE
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
