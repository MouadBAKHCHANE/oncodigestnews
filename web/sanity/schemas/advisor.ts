import { defineField, defineType } from 'sanity';

export const advisor = defineType({
  name: 'advisor',
  title: 'Advisor',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g. "Dr. Mohammed Amal Benzakour"',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
    }),
    defineField({
      name: 'role',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g. "Chirurgien Viscéral, Digestif & Robotique"',
    }),
    defineField({ name: 'institution', type: 'string' }),
    defineField({
      name: 'photo',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'bio',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'quote',
      type: 'text',
      description: 'Pull-quote shown on the advisor card',
    }),
    defineField({
      name: 'specialties',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'links',
      type: 'object',
      fields: [
        { name: 'linkedin', type: 'url' },
        { name: 'website', type: 'url' },
      ],
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Display order on the homepage advisor stack',
    }),
    defineField({
      name: 'isFounder',
      type: 'boolean',
      initialValue: false,
      description: 'Founders are featured on the About page',
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
});
