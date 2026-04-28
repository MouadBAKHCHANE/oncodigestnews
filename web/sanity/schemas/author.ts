import { defineField, defineType } from 'sanity';

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
    }),
    defineField({ name: 'role', type: 'string' }),
    defineField({
      name: 'photo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'bio',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'links',
      type: 'object',
      fields: [
        { name: 'linkedin', type: 'url' },
        { name: 'twitter', type: 'url' },
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
});
