import { defineField, defineType } from 'sanity';

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({
      name: 'context',
      type: 'string',
      options: {
        list: [
          { title: 'Article', value: 'article' },
          { title: 'Scientific article', value: 'scientific' },
          { title: 'Video', value: 'video' },
        ],
      },
      description: 'Which content type this category applies to',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'context' },
  },
});
