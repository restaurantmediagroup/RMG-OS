import accountManagerPhoto from '../assets/team/account-manager.svg';
import photographerPhoto from '../assets/team/photographer.svg';

/** Assigned RMG team members. Photos are neutral placeholders until RMG supplies real headshots. */
export const TEAM = {
  accountManager: { role: 'Account Manager', photo: accountManagerPhoto },
  photographer: { role: 'Photographer', photo: photographerPhoto },
} as const;

export type TeamRole = keyof typeof TEAM;
