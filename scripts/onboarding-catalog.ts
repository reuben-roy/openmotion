import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadTemplatePresentation, showTemplateRecommendations } from '../shared/mcp-template-recommendations.ts';
import { onboardingTemplateIds, selectOnboardingTemplateIds } from '../shared/onboarding-templates.ts';
import { parseArgs } from 'node:util';
import { templateConfig } from '../shared/template-config.ts';

export async function onboardingCatalog(appRoot: string, _dataDirectory?: string, templateIds = selectOnboardingTemplateIds()) {
  const presentation = loadTemplatePresentation({ applicationRoot: appRoot,
    directory: path.join(appRoot, 'mcp-ui/template-recommendations') });
  const recommendation = showTemplateRecommendations(presentation, { templateIds, onboarding: true });
  const templates = recommendation.cards.map(item => ({
    templateId: item.templateId, name: item.title, summary: item.description, durationSeconds: item.durationSeconds,
    kind: 'reference' as const, eligibility: 'requires_recreation' as const,
    requirements: 'Read this exact ID with openmotion_get_template and follow openmotion-recreate. This reference is not a directly copyable builtin project.',
  }));
  return { source: 'approved-onboarding', environment: templateConfig().environment,
    catalogVersion: presentation.resourceVersion, catalogTotal: onboardingTemplateIds.length, included: templates.length,
    truncated: false, stale: false, selectionMode: 'random', recommendedTemplateId: templateIds[0],
    selectionGuide: recommendation.selectionGuide, templates };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const appRoot = fileURLToPath(new URL('../', import.meta.url));
  const { values } = parseArgs({ allowPositionals: true, options: { 'template-ids': { type: 'string' } } });
  console.log(JSON.stringify(await onboardingCatalog(appRoot, undefined,
    values['template-ids'] ? JSON.parse(values['template-ids']) : undefined)));
}
