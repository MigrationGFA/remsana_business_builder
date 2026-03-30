import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Wallet,
  FileDown,
  Mail,
  LogOut,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../components/remsana';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import remsanaIcon from '../../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { getInsiderUser, insiderLogout } from '../../api/insider/auth';
import { MOCK_ANALYST_KPIS } from '../../api/insider/mockData';
import {
  getAnalystKpis,
  getAnalystLearningSummary,
  getAnalystCohorts,
  getAnalystRetentionFunnel,
  getAnalystRegistrationFunnel,
  exportAnalystCsv,
  exportAnalystPdf,
  getAnalystTotalUsers,
  getAnalystActiveUsers,
  getAnalystMrr,
  getAnalystArpu,
  getAnalystChurnRate,
} from '../../api/insiderApi';

type AnalystTab = 'overview' | 'cohorts' | 'revenue' | 'registration';

export default function AnalystDashboardPage() {
  const navigate = useNavigate();
  const user = getInsiderUser();
  const [activeTab, setActiveTab] = useState<AnalystTab>('overview');
  const [kpis, setKpis] = useState(MOCK_ANALYST_KPIS);
  const [loading, setLoading] = useState(false);
  const [cohorts, setCohorts] = useState<any>(null);
  const [retentionFunnel, setRetentionFunnel] = useState<any>(null);
  const [registrationFunnel, setRegistrationFunnel] = useState<any>(null);
  const [learningSummary, setLearningSummary] = useState<any>(null);

  // Individual KPI drill-down state
  const [drillTotalUsers, setDrillTotalUsers] = useState<number | null>(null);
  const [drillActiveUsers, setDrillActiveUsers] = useState<number | null>(null);
  const [drillMrr, setDrillMrr] = useState<number | null>(null);
  const [drillArpu, setDrillArpu] = useState<number | null>(null);
  const [drillChurnRate, setDrillChurnRate] = useState<number | null>(null);
  const [drillLoading, setDrillLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ANALYST') {
      navigate('/insider', { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    loadAnalystData();
    const t = setInterval(() => {
      loadAnalystData();
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const loadAnalystData = async () => {
    setLoading(true);
    try {
      const [kpisData, cohortsData, retentionData, regFunnelData, learningData] = await Promise.all([
        getAnalystKpis(),
        getAnalystCohorts(),
        getAnalystRetentionFunnel(),
        getAnalystRegistrationFunnel(),
        getAnalystLearningSummary(),
      ]);
      if (kpisData) setKpis(kpisData);
      if (cohortsData) setCohorts(cohortsData);
      if (retentionData) setRetentionFunnel(retentionData);
      if (regFunnelData) setRegistrationFunnel(regFunnelData);
      if (learningData) setLearningSummary(learningData);
    } catch (error) {
      console.error('Failed to load analyst data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDrillDownKpis = async () => {
    setDrillLoading(true);
    try {
      const [total, active, mrr, arpu, churn] = await Promise.all([
        getAnalystTotalUsers(),
        getAnalystActiveUsers(),
        getAnalystMrr(),
        getAnalystArpu(),
        getAnalystChurnRate(),
      ]);
      setDrillTotalUsers(total);
      setDrillActiveUsers(active);
      setDrillMrr(mrr);
      setDrillArpu(arpu);
      setDrillChurnRate(churn);
    } catch (error) {
      console.error('Failed to load drill-down KPIs:', error);
    } finally {
      setDrillLoading(false);
    }
  };

  // Load drill-down KPIs when overview tab is active
  useEffect(() => {
    if (activeTab === 'overview' && drillTotalUsers === null) {
      loadDrillDownKpis();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await insiderLogout();
    navigate('/insider', { replace: true });
  };

  const handleExportCsv = async () => {
    const blob = await exportAnalystCsv();
    if (blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `insider-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } else {
      // Fallback to client-side CSV
      const fallback = new Blob(['metric,value\nTotal Users,' + kpis.totalUsers + '\nMRR,' + kpis.mrr + '\n'], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(fallback);
      a.download = `insider-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  };

  const handleExportPdf = async () => {
    const blob = await exportAnalystPdf();
    if (blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `insider-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } else {
      window.print();
    }
  };

  if (!user) return null;

  const changeIcon = (pct: number) => pct >= 0 ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />;

  return (
    <div className="min-h-screen bg-[#f3f0fa]">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={remsanaIcon} alt="REMSANA" className="w-9 h-9 object-contain" />
            <span className="font-semibold text-[#1F2121]">REMSANA ANALYST DASHBOARD</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-[#6B7C7C] hidden sm:inline">{user.email}</span>
            <Button variant="tertiary" size="sm">Profile</Button>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AnalystTab)} className="border-t">
          <TabsList className="w-full max-w-[1200px] mx-auto h-auto flex flex-wrap justify-start gap-0 rounded-none border-0 bg-transparent p-0">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1C1C8B]">
              <BarChart3 className="w-4 h-4 mr-1" /> Overview
            </TabsTrigger>
            <TabsTrigger value="cohorts"><Users className="w-4 h-4 mr-1" /> Cohorts &amp; Retention</TabsTrigger>
            <TabsTrigger value="revenue"><Wallet className="w-4 h-4 mr-1" /> Revenue Analytics</TabsTrigger>
            <TabsTrigger value="registration"><FileDown className="w-4 h-4 mr-1" /> Registration (CAC)</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-[18px] font-semibold text-[#1F2121]">Key Metrics (refreshed every 60s)</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={handleExportCsv}>
              <FileDown className="w-4 h-4 mr-1" /> Export CSV
            </Button>
            <Button size="sm" variant="secondary" onClick={handleExportPdf}>
              Export PDF
            </Button>
            <Button size="sm" variant="tertiary">
              <Mail className="w-4 h-4 mr-1" /> Email Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <Card><CardContent className="p-3"><div className="text-[11px] text-[#6B7C7C]">Total Users</div><div className="text-[16px] font-semibold">{kpis.totalUsers.toLocaleString()}</div><div className="text-[11px] text-green-600">{changeIcon(kpis.totalUsersChangePercent)}{Math.abs(kpis.totalUsersChangePercent)}% from Jan 1</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-[11px] text-[#6B7C7C]">Active (7d)</div><div className="text-[16px] font-semibold">{kpis.activeUsers7d.toLocaleString()}</div><div className="text-[11px] text-green-600">{changeIcon(kpis.activeUsersChangePercent)}{Math.abs(kpis.activeUsersChangePercent)}% vs last week</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-[11px] text-[#6B7C7C]">MRR</div><div className="text-[16px] font-semibold">₦{kpis.mrr}M</div><div className="text-[11px] text-[#6B7C7C]">{kpis.mrrBaselineNote}</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-[11px] text-[#6B7C7C]">ARPU</div><div className="text-[16px] font-semibold">₦{kpis.arpu}</div><div className="text-[11px]">{kpis.arpuChangePercent >= 0 ? '↑' : '↓'} {Math.abs(kpis.arpuChangePercent)}%</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-[11px] text-[#6B7C7C]">Churn Rate</div><div className="text-[16px] font-semibold">{kpis.churnRatePercent}%</div><div className="text-[11px] text-green-600">✅ &lt;{kpis.churnTargetPercent}% ok</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-[11px] text-[#6B7C7C]">CAC Conversion</div><div className="text-[16px] font-semibold">{kpis.cacConversionPercent}%</div><div className="text-[11px] text-green-600">↑ {kpis.cacConversionChangePercent}% vs Week 1</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-[11px] text-[#6B7C7C]">Avg NPS</div><div className="text-[16px] font-semibold">{kpis.avgNps}</div><div className="text-[11px] text-green-600">↑ +{kpis.npsChange} vs Week 1</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-[11px] text-[#6B7C7C]">Active Subs</div><div className="text-[16px] font-semibold">{kpis.activeSubscriptions.toLocaleString()}</div><div className="text-[11px] text-[#6B7C7C]">{kpis.starterPercent}% Starter</div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AnalystTab)}>
          <TabsContent value="overview" className="mt-0 space-y-6">
            {/* Individual KPI Drill-Down */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Real-Time KPI Drill-Down</CardTitle>
                <Button size="sm" variant="secondary" onClick={loadDrillDownKpis} disabled={drillLoading}>
                  {drillLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 bg-[#f3f0fa] rounded-lg">
                    <p className="text-[11px] text-[#6B7C7C]">Total Users (API)</p>
                    <p className="text-[18px] font-semibold">{drillTotalUsers !== null ? drillTotalUsers.toLocaleString() : '—'}</p>
                  </div>
                  <div className="p-3 bg-[#f3f0fa] rounded-lg">
                    <p className="text-[11px] text-[#6B7C7C]">Active Users 7d (API)</p>
                    <p className="text-[18px] font-semibold">{drillActiveUsers !== null ? drillActiveUsers.toLocaleString() : '—'}</p>
                  </div>
                  <div className="p-3 bg-[#f3f0fa] rounded-lg">
                    <p className="text-[11px] text-[#6B7C7C]">MRR (API)</p>
                    <p className="text-[18px] font-semibold">{drillMrr !== null ? `₦${drillMrr.toLocaleString()}` : '—'}</p>
                  </div>
                  <div className="p-3 bg-[#f3f0fa] rounded-lg">
                    <p className="text-[11px] text-[#6B7C7C]">ARPU (API)</p>
                    <p className="text-[18px] font-semibold">{drillArpu !== null ? `₦${drillArpu.toLocaleString()}` : '—'}</p>
                  </div>
                  <div className="p-3 bg-[#f3f0fa] rounded-lg">
                    <p className="text-[11px] text-[#6B7C7C]">Churn Rate (API)</p>
                    <p className="text-[18px] font-semibold">{drillChurnRate !== null ? `${drillChurnRate}%` : '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Cumulative Users (Week 1 – Present)</CardTitle></CardHeader>
              <CardContent>
                <p className="text-[14px]">Target: 5K by Feb 2 | Current: 2K (on track)</p>
                <div className="h-[200px] mt-4 flex items-end gap-1">
                  {[40, 55, 70, 82, 90, 95, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#1C1C8B]/20 rounded-t min-w-[20px]" style={{ height: h + '%' }} />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Revenue by Source (Week 1 – Present)</CardTitle></CardHeader>
              <CardContent>
                <p className="text-[14px]">Subscriptions ~80% | Registration Fees ~20%</p>
                <div className="h-[120px] mt-4 flex items-end gap-1">
                  <div className="flex-1 bg-[#1C1C8B] rounded-t" style={{ height: '80%' }} />
                  <div className="flex-1 bg-[#1C1C8B]/50 rounded-t" style={{ height: '20%' }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>User Acquisition Funnel (Cumulative)</CardTitle></CardHeader>
              <CardContent className="text-[14px] space-y-2">
                <p>Awareness: 2,500 → Signup: 2,047 (82%) → Assessment: 1,890 (92%) → Subscription: 1,632 (86%) → CAC Started: 106 (6.5%) → CAC Approved: 3 (2.8%)</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cohorts" className="mt-0 space-y-6">
            <Card>
              <CardHeader><CardTitle>Subscription Retention by Signup Week</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {cohorts?.data?.length > 0 ? (
                    <table className="w-full text-[14px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Cohort</th>
                          <th className="text-right py-2">Users</th>
                          <th className="text-right py-2">Week 0</th>
                          <th className="text-right py-2">Week 1</th>
                          <th className="text-right py-2">Week 2</th>
                          <th className="text-right py-2">Week 3</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(cohorts.data || cohorts).map((c: any, i: number) => (
                          <tr key={i} className="border-b">
                            <td className="py-2">{c.cohort || c.name || `Cohort ${i + 1}`}</td>
                            <td className="text-right">{c.users?.toLocaleString() || '—'}</td>
                            <td className="text-right">{c.week0 ?? c.retention_week0 ?? '100%'}</td>
                            <td className="text-right">{c.week1 ?? c.retention_week1 ?? '—'}</td>
                            <td className="text-right">{c.week2 ?? c.retention_week2 ?? '—'}</td>
                            <td className="text-right">{c.week3 ?? c.retention_week3 ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-[14px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Cohort</th>
                          <th className="text-right py-2">Week 0</th>
                          <th className="text-right py-2">Week 1</th>
                          <th className="text-right py-2">Week 2</th>
                          <th className="text-right py-2">Week 3</th>
                          <th className="text-right py-2">Avg LTV</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b"><td className="py-2">Jan 2-8</td><td className="text-right">100%</td><td className="text-right">97%</td><td className="text-right">96%</td><td className="text-right">95%</td><td className="text-right">High</td></tr>
                        <tr className="border-b"><td className="py-2">Jan 9-15</td><td className="text-right">100%</td><td className="text-right">98%</td><td className="text-right">97%</td><td className="text-right">—</td><td className="text-right">High</td></tr>
                        <tr className="border-b"><td className="py-2">Jan 16-22</td><td className="text-right">100%</td><td className="text-right">99%</td><td className="text-right">—</td><td className="text-right">—</td><td className="text-right">High</td></tr>
                        <tr className="border-b"><td className="py-2">Jan 23-29</td><td className="text-right">100%</td><td className="text-right">—</td><td className="text-right">—</td><td className="text-right">—</td><td className="text-right">TBD</td></tr>
                      </tbody>
                    </table>
                  )}
                </div>
                <p className="text-[14px] text-[#6B7C7C] mt-2">Churn &lt;1% per week. Target: &gt;95% by Week 4 | Status: ON TRACK</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Retention Funnel</CardTitle></CardHeader>
              <CardContent>
                {retentionFunnel?.steps?.length > 0 ? (
                  <div className="space-y-2">
                    {retentionFunnel.steps.map((step: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[14px] w-40 truncate">{step.name || step.label}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                          <div className="h-full bg-[#1C1C8B]/60 rounded" style={{ width: `${step.percent ?? step.rate ?? 0}%` }} />
                        </div>
                        <span className="text-[14px] font-medium w-16 text-right">{step.count?.toLocaleString() || '—'} ({step.percent ?? step.rate ?? 0}%)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px]">Starter: 1,306 (80%) churn 0.9% | Pro: 244 (15%) churn 0.6% | Business: 82 (5%) churn 0.2%</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="mt-0 space-y-6">
            <Card>
              <CardHeader><CardTitle>Daily Revenue (Last 14 Days)</CardTitle></CardHeader>
              <CardContent>
                <p className="text-[14px]">
                  MRR: {drillMrr !== null ? `₦${drillMrr.toLocaleString()}` : `₦${kpis.mrr}M`} |
                  ARPU: {drillArpu !== null ? `₦${drillArpu.toLocaleString()}` : `₦${kpis.arpu}`} |
                  Churn: {drillChurnRate !== null ? `${drillChurnRate}%` : `${kpis.churnRatePercent}%`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>ARPU by Cohort (Monthly)</CardTitle></CardHeader>
              <CardContent>
                <p className="text-[14px]">Starter ₦1,250–1,300 | Pro ₦4,999–5,350 | Business ₦9,999. Blended ARPU: {drillArpu ? `₦${drillArpu.toLocaleString()}` : `₦${kpis.arpu}`}/mo (target ₦4,000 at scale).</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>LTV &amp; CAC Analysis</CardTitle></CardHeader>
              <CardContent className="text-[14px] space-y-2">
                <p>LTV (12-mo): Starter ₦12.5K | Pro ₦54.9K | Business ₦119.9K. Blended LTV: ₦24.3K.</p>
                <p>CAC (Phase 1): ~₦5K/user. LTV:CAC ≈ 4.86:1 (target &gt;3:1). Payback ~3 months.</p>
              </CardContent>
            </Card>
            {learningSummary && (
              <Card>
                <CardHeader><CardTitle>Learning Summary</CardTitle></CardHeader>
                <CardContent className="text-[14px] space-y-2">
                  <p>Total Enrollments: {learningSummary.totalEnrollments?.toLocaleString() ?? '—'}</p>
                  <p>Completions: {learningSummary.completions?.toLocaleString() ?? '—'}</p>
                  <p>Avg Completion Rate: {learningSummary.completionRate ?? learningSummary.avgCompletionRate ?? '—'}%</p>
                  <p>Certificates Issued: {learningSummary.certificatesIssued?.toLocaleString() ?? '—'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="registration" className="mt-0 space-y-6">
            <Card>
              <CardHeader><CardTitle>Business Name Registration Funnel</CardTitle></CardHeader>
              <CardContent className="text-[14px] space-y-2">
                {registrationFunnel?.steps?.length > 0 ? (
                  <div className="space-y-2">
                    {registrationFunnel.steps.map((step: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-32 truncate">{step.name || step.label}</span>
                        <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                          <div className="h-full bg-[#218D8D]/60 rounded" style={{ width: `${step.percent ?? step.rate ?? 0}%` }} />
                        </div>
                        <span className="font-medium w-20 text-right">{step.count?.toLocaleString() || '—'} ({step.percent ?? step.rate ?? 0}%)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p>Started: 106 → Step 1: 104 (98%) → Step 2: 98 (94%) → Step 3: 92 (94%) → Step 4: 89 (97%) → Submitted: 84 (94%) → CAC Approved: 3 (3.6%).</p>
                    <p className="text-[#6B7C7C]">Bottleneck: CAC processing slow (manual, 2–3 days). Automation planned Week 15.</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>CAC Status Distribution</CardTitle></CardHeader>
              <CardContent>
                {registrationFunnel?.statusDistribution ? (
                  <div className="text-[14px] space-y-1">
                    {Object.entries(registrationFunnel.statusDistribution).map(([status, count]: [string, any]) => (
                      <p key={status}>{status}: {count}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px]">Submitted: 81 (95.2%) | Approved: 3 (3.5%, avg 1.8 days) | Rejected: 1 (1.2%)</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Registrations by State</CardTitle></CardHeader>
              <CardContent>
                {registrationFunnel?.byState ? (
                  <div className="text-[14px] space-y-1">
                    {Object.entries(registrationFunnel.byState).map(([state, count]: [string, any]) => (
                      <p key={state}>{state}: {count}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px]">Lagos: 40 (47%) | Abuja: 18 (21%) | Kano: 14 (17%) | Port Harcourt: 8 (10%) | Others: 4 (5%)</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
