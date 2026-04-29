import type { Metadata } from 'next';
import type { PortableTextBlock } from '@portabletext/types';
import { sanityClient } from '@/lib/sanity/client';
import { LegalPage } from '../_components/LegalPage';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Mentions légales d’OncoDigest — informations sur l’éditeur, l’hébergement et la propriété intellectuelle.',
};

interface SettingsResponse {
  legalText?: PortableTextBlock[];
  _updatedAt?: string;
}

export default async function MentionsLegalesPage() {
  const settings = await sanityClient.fetch<SettingsResponse>(
    /* groq */ `*[_type == "siteSettings"][0]{ legalText, _updatedAt }`,
  );

  const lastUpdated = settings?._updatedAt
    ? new Date(settings._updatedAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : undefined;

  return (
    <LegalPage
      title="Mentions légales"
      lastUpdated={lastUpdated}
      body={settings?.legalText}
    />
  );
}
