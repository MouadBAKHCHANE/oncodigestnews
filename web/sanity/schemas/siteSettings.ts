import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteName', type: 'string', initialValue: 'OncoDigest' }),
    defineField({ name: 'tagline', type: 'string' }),
    defineField({
      name: 'heroTypewriterWords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Words cycled in the hero typewriter',
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'heroOverlay',
      type: 'object',
      fields: [
        { name: 'name', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'ctaText', type: 'string' },
        { name: 'ctaHref', type: 'string' },
      ],
    }),
    defineField({
      name: 'contact',
      type: 'object',
      fields: [
        { name: 'email', type: 'string' },
        { name: 'address', type: 'text' },
        { name: 'phone', type: 'string' },
      ],
    }),
    defineField({
      name: 'social',
      type: 'object',
      fields: [
        { name: 'linkedin', type: 'url' },
        { name: 'twitter', type: 'url' },
        { name: 'youtube', type: 'url' },
      ],
    }),
    defineField({
      name: 'legalText',
      title: 'Mentions légales (full text)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'privacyText',
      title: 'Politique de confidentialité (full text)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site settings' }),
  },
});
