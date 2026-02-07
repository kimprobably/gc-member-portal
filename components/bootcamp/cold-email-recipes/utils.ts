import type { BootcampContact } from '../../../types/cold-email-recipe-types';

export function interpolate(
  text: string,
  fields: Record<string, string>,
  preserveUnresolved = false
): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const value = fields[key.trim()];
    if (value !== undefined) return value;
    return preserveUnresolved ? match : '';
  });
}

export function buildContactFields(contact: BootcampContact): Record<string, string> {
  return {
    first_name: contact.firstName,
    last_name: contact.lastName,
    email: contact.email,
    company: contact.company,
    title: contact.title,
    linkedin_url: contact.linkedinUrl,
    ...contact.customFields,
    ...contact.stepOutputs,
  };
}
