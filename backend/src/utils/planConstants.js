export const FREE_TEMPLATES = ['modern'];
export const PREMIUM_TEMPLATES = ['classic', 'minimalist'];
export const ALL_TEMPLATES = [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES];

export const isPremiumTemplate = (templateId) => PREMIUM_TEMPLATES.includes(templateId);

export const isProPlan = (user) => {
  if (!user) return false;
  if (user.plan === 'PRO') return true;
  return ['active', 'trialing'].includes(user.subscriptionStatus);
};

export const resolveTemplateForUser = (templateId, user) => {
  const requested = templateId || 'modern';
  if (isPremiumTemplate(requested) && !isProPlan(user)) {
    return 'modern';
  }
  return ALL_TEMPLATES.includes(requested) ? requested : 'modern';
};
