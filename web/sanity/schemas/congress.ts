import { defineField, defineType } from 'sanity';

export const congress = defineType({
  name: 'congress',
  title: 'Congress',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g. "ESMO 2026"',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortName',
      type: 'string',
      description: 'e.g. ESMO, ASCO, ESCO',
    }),
    defineField({
      name: 'startDate',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'object',
      fields: [
        { name: 'city', type: 'string' },
        { name: 'country', type: 'string' },
      ],
    }),
    defineField({ name: 'website', type: 'url' }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'summary',
      title: 'Public summary',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'highlights',
      title: 'Pro highlights (gated)',
      type: 'array',
      of: [{ type: 'block' }],
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
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show in featured slot on /congres',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Start date, soonest first',
      name: 'startAsc',
      by: [{ field: 'startDate', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'startDate', media: 'coverImage' },
  },
});
