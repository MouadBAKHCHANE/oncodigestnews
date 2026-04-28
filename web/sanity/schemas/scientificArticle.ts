import { defineField, defineType } from 'sanity';

export const scientificArticle = defineType({
  name: 'scientificArticle',
  title: 'Scientific Article',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'access',
      type: 'string',
      options: {
        list: [
          { title: '🌐 Public', value: 'public' },
          { title: '🔒 Pro', value: 'pro' },
        ],
        layout: 'radio',
      },
      initialValue: 'public',
    }),
    defineField({
      name: 'authors',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Author names as they appear on the paper',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'journal',
      type: 'string',
      description: 'e.g. NEJM, The Lancet Oncology',
    }),
    defineField({
      name: 'doi',
      type: 'string',
      description: 'e.g. 10.1056/NEJMoa2023456',
    }),
    defineField({
      name: 'externalUrl',
      type: 'url',
      description: 'Link to original paper',
    }),
    defineField({
      name: 'congress',
      type: 'reference',
      to: [{ type: 'congress' }],
      description: 'If the article was presented at a congress',
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'excerpt',
      title: 'Public abstract',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'commentary',
      title: 'Editorial commentary (gated when Access = Pro)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'journal', media: 'coverImage' },
  },
});
