import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

export type PlanId = 'free' | 'essentiel' | 'pro' | 'entreprise';
export type RoleId = 'owner' | 'admin' | 'user';

export interface PlanLimits {
  vehicles: number | 'unlimited';
  reservationsPerMonth: number | 'unlimited';
  pdfPerMonth: number | 'unlimited';
  users: number | 'unlimited';
  photos: 'limited' | 'unlimited';
  videoEnabled: boolean;
}

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    vehicles: 1,
    reservationsPerMonth: 3,
    pdfPerMonth: 3,
    users: 1,
    photos: 'limited',
    videoEnabled: false,
  },
  essentiel: {
    vehicles: 5,
    reservationsPerMonth: 30,
    pdfPerMonth: 30,
    users: 1,
    photos: 'limited',
    videoEnabled: false,
  },
  pro: {
    vehicles: 15,
    reservationsPerMonth: 100,
    pdfPerMonth: 'unlimited',
    users: 3,
    photos: 'limited',
    videoEnabled: true,
  },
  entreprise: {
    vehicles: 100,
    reservationsPerMonth: 'unlimited',
    pdfPerMonth: 'unlimited',
    users: 'unlimited',
    photos: 'unlimited',
    videoEnabled: true,
  }
};

const STORAGE_PLAN_KEY = 'easygarage.plan.v1';
const STORAGE_USAGE_KEY = 'easygarage.usage.v1';

export const SubscriptionLinks = {
  // Configure these via env if available
  portalUrl: (userId?: string) => process.env.EXPO_PUBLIC_STRIPE_PORTAL_URL || 'https://billing.stripe.com/p/login/test_portal',
  checkoutUrl: (plan: PlanId, userId?: string) => {
    const base = process.env.EXPO_PUBLIC_STRIPE_CHECKOUT_BASE || 'https://buy.stripe.com/test_';
    const mapping: Record<PlanId, string> = {
      free: '',
      essentiel: base + 'essentiel',
      pro: base + 'pro',
      entreprise: base + 'entreprise',
    };
    return mapping[plan];
  }
};

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

export type UsageCounter = 'reservationsCount' | 'pdfCount' | 'vehiclesCount' | 'usersCount';

export const PlanService = {
  async getCurrentPlan(): Promise<PlanId> {
    const val = await AsyncStorage.getItem(STORAGE_PLAN_KEY);
    return (val as PlanId) || 'free';
  },
  async setCurrentPlan(plan: PlanId): Promise<void> {
    await AsyncStorage.setItem(STORAGE_PLAN_KEY, plan);
  },
  getPlanLimits(plan: PlanId): PlanLimits {
    return PLANS[plan];
  },
  async incrementUsage(counter: UsageCounter, by: number = 1): Promise<void> {
    const month = currentMonthKey();
    const raw = (await AsyncStorage.getItem(STORAGE_USAGE_KEY)) || '{}';
    const data = JSON.parse(raw) as Record<string, Record<UsageCounter, number>>;
    const monthData = data[month] || { reservationsCount: 0, pdfCount: 0, vehiclesCount: 0, usersCount: 0 };
    monthData[counter] = (monthData[counter] || 0) + by;
    data[month] = monthData;
    await AsyncStorage.setItem(STORAGE_USAGE_KEY, JSON.stringify(data));
  },
  async getUsage(counter: UsageCounter): Promise<number> {
    const month = currentMonthKey();
    const raw = (await AsyncStorage.getItem(STORAGE_USAGE_KEY)) || '{}';
    const data = JSON.parse(raw) as Record<string, Record<UsageCounter, number>>;
    const monthData = data[month] || {} as Record<UsageCounter, number>;
    return monthData[counter] || 0;
  },
  async resetUsage(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_USAGE_KEY);
  },
  async roleGuard(userRole: RoleId, required: RoleId): Promise<{ allowed: boolean; reason?: string }> {
    const order: RoleId[] = ['user', 'admin', 'owner'];
    const allowed = order.indexOf(userRole) >= order.indexOf(required);
    return { allowed, reason: allowed ? undefined : 'Rôle insuffisant' };
  },
  async planGuard(feature: 'video' | 'photos' | 'pdf'): Promise<{ allowed: boolean; reason?: string; plan: PlanId }> {
    const plan = await this.getCurrentPlan();
    const limits = PLANS[plan];
    let allowed = true;
    if (feature === 'video') allowed = !!limits.videoEnabled;
    if (feature === 'photos') allowed = true; // all plans allow photos per spec
    if (feature === 'pdf') allowed = true; // limited by usage
    return { allowed, reason: allowed ? undefined : 'Fonction non incluse dans votre plan', plan };
  },
  async usageGuard(counter: UsageCounter): Promise<{ allowed: boolean; reason?: string; remaining?: number; plan: PlanId }> {
    const plan = await this.getCurrentPlan();
    const limits = PLANS[plan];
    const used = await this.getUsage(counter);
    let limit: number | 'unlimited' = 0;
    if (counter === 'reservationsCount') limit = limits.reservationsPerMonth;
    else if (counter === 'pdfCount') limit = limits.pdfPerMonth;
    else if (counter === 'vehiclesCount') limit = limits.vehicles;
    else if (counter === 'usersCount') limit = limits.users;
    if (limit === 'unlimited') return { allowed: true, plan };
    const remaining = (limit as number) - used;
    return { allowed: remaining > 0, remaining, reason: remaining <= 0 ? 'Limite atteinte' : undefined, plan };
  },
  async openPortal(userId?: string) {
    const url = SubscriptionLinks.portalUrl(userId);
    if (url) await Linking.openURL(url);
  },
  async openCheckout(plan: PlanId, userId?: string) {
    const url = SubscriptionLinks.checkoutUrl(plan, userId);
    if (url) await Linking.openURL(url);
  }
};
