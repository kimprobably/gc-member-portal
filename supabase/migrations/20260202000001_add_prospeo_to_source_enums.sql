-- Add 'prospeo' to source enums for TAM tables
ALTER TYPE tam_company_source ADD VALUE IF NOT EXISTS 'prospeo';
ALTER TYPE tam_contact_source ADD VALUE IF NOT EXISTS 'prospeo';
