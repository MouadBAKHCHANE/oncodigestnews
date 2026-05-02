import { defineField, defineType } from 'sanity';

export const evenement = defineType({
  name: 'evenement',
  title: 'Évènement',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Ex. "ASCO 2025 — Congrès Américain de Cancérologie"',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Congrès', value: 'congres' },
          { title: 'Webinaire', value: 'webinaire' },
          { title: 'Symposium', value: 'symposium' },
          { title: 'Conférence', value: 'conference' },
          { title: 'Autre', value: 'autre' },
        ],
        layout: 'radio',
      },
      initialValue: 'congres',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: '🟢 À venir', value: 'upcoming' },
          { title: '🔴 En cours', value: 'live' },
          { title: '⚫ Passé', value: 'past' },
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isFeatured',
      title: 'Mettre en avant',
      type: 'boolean',
      description: 'Affiche dans le slot principal (un seul à la fois)',
      initialValue: false,
    }),
    defineField({
      name: 'startDate',
      title: 'Date de début',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'Date de fin',
      type: 'date',
    }),
    defineField({
      name: 'location',
      title: 'Lieu',
      type: 'object',
      fields: [
        defineField({ name: 'city', title: 'Ville', type: 'string' }),
        defineField({ name: 'country', title: 'Pays', type: 'string' }),
        defineField({
          name: 'isOnline',
          title: 'En ligne',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Ex. Oncologie, Chirurgie digestive, Immunothérapie',
    }),
    defineField({
      name: 'coverImage',
      title: 'Image de couverture',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Texte alternatif', type: 'string' }),
      ],
    }),
    defineField({
      name: 'externalUrl',
      title: 'Site officiel',
      type: 'url',
      description: 'Lien vers le site du congrès ou de l\'événement',
    }),
    defineField({
      name: 'reportSlug',
      title: 'Lien vers le rapport interne',
      type: 'string',
      description: 'Slug du congrès ou article associé (ex. /congres/asco-2025)',
    }),
  ],
  orderings: [
    {
      title: 'Date (plus récent d\'abord)',
      name: 'startDesc',
      by: [{ field: 'startDate', direction: 'desc' }],
    },
    {
      title: 'Date (plus ancien d\'abord)',
      name: 'startAsc',
      by: [{ field: 'startDate', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'startDate',
      status: 'status',
      media: 'coverImage',
    },
    prepare({ title, subtitle, status }) {
      const icons: Record<string, string> = { upcoming: '🟢', live: '🔴', past: '⚫' };
      return {
        title: `${icons[status] ?? ''} ${title}`,
        subtitle,
      };
    },
  },
});
