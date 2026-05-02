import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('📰 Editorial')
        .child(
          S.list()
            .title('Editorial')
            .items([
              S.documentTypeListItem('article').title('Articles'),
              S.documentTypeListItem('scientificArticle').title('Scientific articles'),
              S.documentTypeListItem('congress').title('Congress'),
              S.documentTypeListItem('evenement').title('Évènements'),
              S.documentTypeListItem('video').title('Videos'),
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
                    .documentId('siteSettings'),
                ),
            ]),
        ),
    ]);
