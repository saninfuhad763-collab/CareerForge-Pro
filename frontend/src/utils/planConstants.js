export const FREE_TEMPLATES = ['modern'];
export const PREMIUM_TEMPLATES = ['classic', 'minimalist'];

export const isPremiumTemplate = (templateId) => PREMIUM_TEMPLATES.includes(templateId);

export const isProUser = (user) => {
  if (!user) return false;
  if (user.plan === 'PRO') return true;
  return ['active', 'trialing'].includes(user.subscriptionStatus);
};
