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

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Au moins 8 caractères')
      .max(128, 'Mot de passe trop long')
      .regex(/[A-Z]/, 'Doit contenir une majuscule')
      .regex(/[a-z]/, 'Doit contenir une minuscule')
      .regex(/[0-9]/, 'Doit contenir un chiffre'),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['passwordConfirm'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const registrationSchema = z
  .object({
    nom: z
      .string()
      .min(2, 'Le nom doit faire au moins 2 caractères')
      .max(80, 'Le nom est trop long')
      .trim(),
    prenom: z
      .string()
      .min(2, 'Le prénom doit faire au moins 2 caractères')
      .max(80, 'Le prénom est trop long')
      .trim(),
    email: z
      .string()
      .email('Adresse email invalide')
      .max(254, 'Email trop long')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, 'Le mot de passe doit faire au moins 8 caractères')
      .max(128, 'Mot de passe trop long')
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre'),
    passwordConfirm: z.string(),
    profession: z.enum(
      ['chirurgien', 'oncologue', 'gastro-enterologue', 'interne', 'autre'],
      { message: 'Veuillez sélectionner une profession' },
    ),
    specialite: z.string().max(120).trim().optional().or(z.literal('')),
    ville: z.string().max(120).trim().optional().or(z.literal('')),
    acceptTerms: z.literal(true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['passwordConfirm'],
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
