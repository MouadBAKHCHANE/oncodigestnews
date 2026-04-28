import { defineField, defineType } from 'sanity';

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'string',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'ogImage',
      title: 'OG image',
      type: 'image',
    }),
    defineField({
      name: 'noindex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
