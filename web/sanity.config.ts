import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';
import { structure } from './sanity/structure';
import { apiVersion, dataset, projectId, studioBasePath } from './sanity/env';

export default defineConfig({
  basePath: studioBasePath,
  projectId,
  dataset,
  title: 'OncoDigest Studio',
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
