import { defineField, defineType } from 'sanity';

export const partner = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'logo',
      type: 'image',
      validation: (Rule) => Rule.required(),
      description: 'SVG or transparent PNG, monochrome preferred',
    }),
    defineField({ name: 'website', type: 'url' }),
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
    select: { title: 'name', media: 'logo' },
  },
});
