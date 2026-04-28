import { defineField, defineType } from 'sanity';

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({
      name: 'description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'thumbnail',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'videoUrl',
      type: 'url',
      description: 'YouTube, Vimeo, or direct mp4',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'durationSeconds',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({ name: 'category', type: 'reference', to: [{ type: 'category' }] }),
    defineField({
      name: 'speakers',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'advisor' }, { type: 'author' }] }],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
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
  ],
  preview: {
    select: { title: 'title', media: 'thumbnail', access: 'access' },
    prepare: ({ title, media, access }) => ({
      title: `${access === 'pro' ? '🔒 ' : ''}${title}`,
      media,
    }),
  },
});
