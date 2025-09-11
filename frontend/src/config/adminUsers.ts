export const ADMIN_EMAILS: readonly string[] = [
  'lhfurquim@latam.stefanini.com',
  'fegoncalves@latam.stefanini.com'
] as const;

export const isAdminUser = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export type AdminEmail = typeof ADMIN_EMAILS[number];