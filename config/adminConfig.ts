/**
 * Admin Configuration
 * Controls access to the admin dashboard at /admin routes
 */

// Add authorized admin emails here
export const ADMIN_EMAILS: string[] = [
  'kristaps@peak9.co',
  // Add more admin emails as needed
];

/**
 * Check if an email has admin access
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email.toLowerCase());
}
