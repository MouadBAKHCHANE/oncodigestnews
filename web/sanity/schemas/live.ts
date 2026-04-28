import { defineField, defineType } from 'sanity';

export const live = defineType({
  name: 'live',
  title: 'Live event',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({
      name: 'startsAt',
      title: 'Starts at',
      type: 'datetime',
      description: 'Date AND time the live starts (Europe/Paris)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'durationMinutes',
      type: 'number',
      initialValue: 60,
      validation: (Rule) => Rule.min(5).max(480),
    }),
    defineField({
      name: 'speakers',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'advisor' }, { type: 'author' }] }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'registrationUrl',
      type: 'url',
      description: 'External link to register (Zoom, Teams, etc.)',
    }),
    defineField({
      name: 'replayVideo',
      type: 'reference',
      to: [{ type: 'video' }],
      description: 'Set after the live ends, links to the recording',
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
      initialValue: 'pro',
    }),
  ],
  orderings: [
    {
      title: 'Upcoming first',
      name: 'startsAtAsc',
      by: [{ field: 'startsAt', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', startsAt: 'startsAt', access: 'access' },
    prepare: ({ title, startsAt, access }) => ({
      title: `${access === 'pro' ? '🔒 ' : ''}${title}`,
      subtitle: startsAt
        ? new Date(startsAt).toLocaleString('fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        : '',
    }),
  },
});
