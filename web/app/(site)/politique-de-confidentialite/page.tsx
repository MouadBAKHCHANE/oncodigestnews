import type { Metadata } from 'next';
import type { PortableTextBlock } from '@portabletext/types';
import { sanityClient } from '@/lib/sanity/client';
import { LegalPage } from '../_components/LegalPage';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité d’OncoDigest — gestion des données personnelles, cookies et droits des utilisateurs.',
};

interface SettingsResponse {
  privacyText?: PortableTextBlock[];
  _updatedAt?: string;
}

export default async function PolitiqueDeConfidentialitePage() {
  const settings = await sanityClient.fetch<SettingsResponse>(
    /* groq */ `*[_type == "siteSettings"][0]{ privacyText, _updatedAt }`,
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
      title="Politique de confidentialité"
      lastUpdated={lastUpdated}
      body={settings?.privacyText}
    />
  );
}
