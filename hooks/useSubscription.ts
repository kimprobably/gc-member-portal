import { useMemo } from 'react';
import { BootcampStudent } from '../types/bootcamp-types';
import { LmsCohort } from '../types/lms-types';

export type AccessState = 'active' | 'expiring' | 'expired' | 'subscribed';

interface UseSubscriptionResult {
  accessState: AccessState;
  daysRemaining: number | null;
  canUseAiTools: boolean;
  isReadOnly: boolean;
  accessExpiresAt: Date | null;
}

export function useSubscription(
  student: BootcampStudent | null,
  cohort: LmsCohort | null
): UseSubscriptionResult {
  return useMemo(() => {
    // Default state if no student
    if (!student) {
      return {
        accessState: 'expired' as AccessState,
        daysRemaining: null,
        canUseAiTools: false,
        isReadOnly: true,
        accessExpiresAt: null,
      };
    }

    // Subscribed users always have full access
    if (student.subscriptionStatus === 'active') {
      return {
        accessState: 'subscribed' as AccessState,
        daysRemaining: null,
        canUseAiTools: true,
        isReadOnly: false,
        accessExpiresAt: null,
      };
    }

    // Calculate access expiration (cohort end + 4 weeks)
    const cohortEndDate = cohort?.endDate ? new Date(cohort.endDate) : null;

    if (!cohortEndDate) {
      // No end date means unlimited access (for now)
      return {
        accessState: 'active' as AccessState,
        daysRemaining: null,
        canUseAiTools: true,
        isReadOnly: false,
        accessExpiresAt: null,
      };
    }

    const accessExpiresAt = new Date(cohortEndDate);
    accessExpiresAt.setDate(accessExpiresAt.getDate() + 28); // +4 weeks

    const now = new Date();
    const msRemaining = accessExpiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    // Expired
    if (daysRemaining <= 0) {
      return {
        accessState: 'expired' as AccessState,
        daysRemaining: 0,
        canUseAiTools: false,
        isReadOnly: true,
        accessExpiresAt,
      };
    }

    // Expiring (final 7 days)
    if (daysRemaining <= 7) {
      return {
        accessState: 'expiring' as AccessState,
        daysRemaining,
        canUseAiTools: true,
        isReadOnly: false,
        accessExpiresAt,
      };
    }

    // Active
    return {
      accessState: 'active' as AccessState,
      daysRemaining,
      canUseAiTools: true,
      isReadOnly: false,
      accessExpiresAt,
    };
  }, [student, cohort]);
}
