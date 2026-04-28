import { defineField, defineType } from 'sanity';

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({ name: 'question', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'answer',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'order', type: 'number' }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'question' },
  },
});
