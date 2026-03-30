import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, CreditCard, Save, Mail, Phone, Shield, ChevronRight } from 'lucide-react';
import { Button, Input, Alert, Modal, ModalFooter } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { getUserProfile, updateUserProfile, hasBackend } from '../api/userApi';
import { getMySubscription, upgradeSubscription, cancelSubscription } from '../api/subscriptionApi';
import { updateUserProfile as updateAuthProfile } from '../services/authService';
import type { UserProfile } from '../api/userApi';
import type { Subscription } from '../api/subscriptionApi';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileData, subData] = await Promise.all([
        getUserProfile(),
        getMySubscription(),
      ]);
      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setPhoneNumber(profileData.phone_number || '');
      }
      setSubscription(subData);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateUserProfile({
        full_name: fullName,
        phone_number: phoneNumber,
      });
      setProfile(updated);
      // Sync auth service profile as well
      try {
        await updateAuthProfile({ full_name: fullName, phone_number: phoneNumber } as any);
      } catch (_) {
        // Non-critical: auth profile sync is best-effort
      }
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    setSaving(true);
    setError('');
    try {
      const updated = await upgradeSubscription(tier);
      setSubscription(updated);
      setSuccess(`Upgraded to ${tier} successfully`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upgrade');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelReason.trim()) {
      setError('Please provide a reason');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await cancelSubscription(cancelReason);
      setSubscription(updated);
      setShowCancelModal(false);
      setCancelReason('');
      setSuccess('Subscription cancelled');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to cancel');
    } finally {
      setSaving(false);
    }
  };

  if (!hasBackend()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8f6ff] to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Available</h2>
          <p className="text-sm text-gray-400 mb-6">Backend service is not configured.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8f6ff] to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <img src={remsanaIcon} alt="Remsana" className="h-8 w-8" />
          <h1 className="text-base font-bold text-gray-900">Profile & Settings</h1>
        </div>
      </header>

      {/* Profile Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C8B] via-[#2d2da0] to-[#667eea]" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {(profile?.full_name?.[0] || profile?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile?.full_name || fullName || 'Your Profile'}</h2>
            <p className="text-sm text-white/60">{profile?.email || ''}</p>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-4 relative z-10 pb-8 space-y-5">
        {error && <Alert variant="error" message={error} dismissible onDismiss={() => setError('')} />}
        {success && <Alert variant="success" message={success} dismissible onDismiss={() => setSuccess('')} />}

        {loading ? (
          <div className="space-y-4 pt-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                <div className="h-10 bg-gray-50 rounded-xl" />
                <div className="h-10 bg-gray-50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#1C1C8B] to-[#667eea]" />
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[#1C1C8B]/10 flex items-center justify-center">
                    <User className="w-4.5 h-4.5 text-[#1C1C8B]" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input value={profile?.email || ''} disabled className="pl-10 !bg-gray-50 !text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+234..." className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-50">
                  <Button onClick={handleSaveProfile} disabled={saving} variant="primary" size="md">
                    <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Subscription card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <CreditCard className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Subscription</h3>
                </div>

                {subscription ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {subscription.tier?.charAt(0).toUpperCase() + subscription.tier?.slice(1)} Plan
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Status: <span className="capitalize">{subscription.status}</span></p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${subscription.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {subscription.status === 'active' ? 'Active' : subscription.status}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      {subscription.tier !== 'premium' && (
                        <Button size="sm" variant="primary" onClick={() => handleUpgrade('premium')} disabled={saving}>
                          Upgrade to Premium
                        </Button>
                      )}
                      {subscription.status === 'active' && (
                        <Button size="sm" variant="secondary" onClick={() => setShowCancelModal(true)} disabled={saving}>
                          Cancel Subscription
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400">No subscription information available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 overflow-hidden">
              <div className="divide-y divide-gray-50">
                <button onClick={() => navigate('/mfa-setup')} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors text-left">
                  <div className="w-9 h-9 rounded-xl bg-[#1C1C8B]/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4.5 h-4.5 text-[#1C1C8B]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">MFA Security</p>
                    <p className="text-[11px] text-gray-400">Manage two-factor authentication</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
                <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors text-left">
                  <div className="w-9 h-9 rounded-xl bg-[#218D8D]/10 flex items-center justify-center flex-shrink-0">
                    <ArrowLeft className="w-4.5 h-4.5 text-[#218D8D]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Back to Dashboard</p>
                    <p className="text-[11px] text-gray-400">Return to your main dashboard</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <Modal isOpen={showCancelModal} title="Cancel Subscription" onClose={() => setShowCancelModal(false)}>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to cancel your subscription? Please let us know why.
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation…"
            rows={3}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C8B]/30 focus:border-[#1C1C8B]/30 mb-4 transition-all"
          />
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Keep Subscription</Button>
            <Button variant="danger" onClick={handleCancelSubscription} disabled={saving}>
              {saving ? 'Cancelling…' : 'Confirm Cancel'}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
