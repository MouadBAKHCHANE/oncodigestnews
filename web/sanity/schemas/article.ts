import { defineField, defineType } from 'sanity';

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(140),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'access',
      title: 'Access level',
      type: 'string',
      options: {
        list: [
          { title: '🌐 Public', value: 'public' },
          { title: '🔒 Pro (logged-in only)', value: 'pro' },
        ],
        layout: 'radio',
      },
      initialValue: 'public',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tag',
      type: 'string',
      description: 'Small label shown on cards (e.g. "RECHERCHE")',
    }),
    defineField({
      name: 'excerpt',
      title: 'Public excerpt',
      description: 'Always visible, used as teaser + paywall preview',
      type: 'array',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }] }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body (gated when Access = Pro)',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
        },
        {
          type: 'object',
          name: 'callout',
          fields: [
            { name: 'text', type: 'text' },
            {
              name: 'tone',
              type: 'string',
              options: { list: ['info', 'warning', 'highlight'] },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'readingTime',
      type: 'number',
      description: 'Minutes (auto-calculated, editable)',
    }),
    defineField({
      name: 'relatedArticles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'seo',
      type: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      access: 'access',
      publishedAt: 'publishedAt',
    },
    prepare: ({ title, media, access, publishedAt }) => ({
      title: `${access === 'pro' ? '🔒 ' : ''}${title}`,
      subtitle: publishedAt ? new Date(publishedAt).toLocaleDateString('fr-FR') : '',
      media,
    }),
  },
  orderings: [
    {
      title: 'Published, newest first',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
});
