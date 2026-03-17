import { api, hasBackend } from './httpClient';

export type NavbarProfile = {
  name: string;
  email: string;
  tier?: string;
  phone?: string;
  status?: string;
  signupDate?: string;
  mfaEnabled?: boolean;
  assessmentComplete?: boolean;
  npsScore?: number | null;
};

export type NavbarNotification = {
  id: string;
  title: string;
  read: boolean;
  createdAt?: string;
};


const DEFAULT_NOTIFICATION_LIMIT = 5;

export async function getNavbarProfile(): Promise<NavbarProfile | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    const response = await api.get('/users/me');
    const user = response.data?.user ?? response.data;
    return {
      name: user.full_name || user.name || user.email,
      email: user.email,
      tier: user.subscription_tier,
      phone: user.phone_number,
      status: user.subscription_status,
      signupDate: user.signup_date,
      mfaEnabled: user.mfa_enabled,
      assessmentComplete: user.assessment_complete,
      npsScore: user.nps_score,
    };
  } catch (error) {
    console.error('Failed to fetch navbar profile:', error);
    return null;
  }
}

export async function getNavbarNotifications(): Promise<NavbarNotification[] | null> {
  return Array.from({ length: DEFAULT_NOTIFICATION_LIMIT }).map((_, index) => ({
    id: `placeholder-${index + 1}`,
    title: 'No notifications yet',
    read: true,
    createdAt: undefined,
  }));
}

