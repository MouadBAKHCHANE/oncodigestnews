import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('📰 Éditorial')
        .child(
          S.list()
            .title('Éditorial')
            .items([
              S.documentTypeListItem('article').title('Actualités'),
              S.documentTypeListItem('scientificArticle').title('Articles scientifiques'),
              S.documentTypeListItem('congress').title('Congrès'),
              S.documentTypeListItem('video').title('Vidéos'),
              S.documentTypeListItem('live').title('Lives'),
            ]),
        ),
      S.listItem()
        .title('👥 People')
        .child(
          S.list()
            .title('People')
            .items([
              S.documentTypeListItem('advisor').title('Advisors (comité)'),
              S.documentTypeListItem('author').title('Authors'),
              S.documentTypeListItem('partner').title('Partners'),
            ]),
        ),
      S.listItem()
        .title('📄 Site')
        .child(
          S.list()
            .title('Site')
            .items([
              S.documentTypeListItem('faq').title('FAQ'),
              S.documentTypeListItem('category').title('Categories'),
              S.listItem()
                .title('Site settings')
                .child(
                  S.editor()
                    .id('siteSettings')
                    .schemaType('siteSettings')
                    .documentId('662831bd-9ee2-4d1c-bdcc-1f8675d318e7'),
                ),
            ]),
        ),
    ]);
