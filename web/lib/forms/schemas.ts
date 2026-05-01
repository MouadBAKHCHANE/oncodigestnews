/**
 * Zod schemas — single source of truth for form validation.
 *
 * Used by:
 *   - client (react-hook-form + zodResolver) for inline + submit-time validation
 *   - server (route handlers + server actions) to re-validate before any side effect
 *
 * Spec: docs/FORM-RULES.md.
 */

import { z } from 'zod';

export const contactSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit faire au moins 2 caractères')
    .max(80, 'Le nom est trop long')
    .trim(),
  email: z
    .string()
    .email('Adresse email invalide')
    .max(254, 'Email trop long')
    .toLowerCase()
    .trim(),
  sujet: z.enum(['question', 'article', 'partenariat', 'erreur', 'autre']),
  message: z
    .string()
    .min(10, 'Le message doit faire au moins 10 caractères')
    .max(5000, 'Le message est trop long (max 5000 caractères)')
    .trim(),
  /** Honeypot — must be empty. */
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email('Adresse email invalide')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
