import type { TemplateContext } from './types';
import { renderDefaultRoutingRules } from '../personalization-config';

export function generateDefaultRoutingRules(_ctx: TemplateContext): string {
  return renderDefaultRoutingRules();
}
