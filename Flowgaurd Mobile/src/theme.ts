/**
 * FlowGuard design tokens - identical values to the Figma handoff in
 * README.md. Blues carry the brand; yellow/orange/red are reserved ONLY
 * for alert severity, so colour reads as urgency at a glance, not decor.
 */
export const colors = {
  // Brand blues
  harbor900: '#0B3C5D',   // headers, nav bar, high-emphasis text
  current700: '#146B9E',  // primary buttons, active tab
  waterline500: '#2B98CC',// links, secondary actions
  sky300: '#8FCBE8',      // borders, chips, tints
  foam100: '#E7F5FB',     // card backgrounds, selected state
  rain: '#3FB6C4',        // accent - map pins, progress, CTAs on dark

  // Severity scale - the ONLY places yellow/orange/red should appear
  clear: '#2F9E5C',
  advisory: '#F0B429',
  warning: '#E8790C',
  critical: '#D6304A',

  // Neutrals
  ink: '#10202B',
  slate: '#4B5D68',
  ash: '#8B98A1',
  divider: '#DCE4E8',
  cloud: '#F5F8FA',
  white: '#FFFFFF',
};

export type Severity = 'clear' | 'advisory' | 'warning' | 'critical';

export const severityColor = (s: Severity): string =>
  ({ clear: colors.clear, advisory: colors.advisory, warning: colors.warning, critical: colors.critical }[s]);

export const severityLabel = (s: Severity): string =>
  ({ clear: 'All clear', advisory: 'Advisory', warning: 'Warning', critical: 'Critical' }[s]);

/** Parses Firestore's lowercase severity string, defaulting safely. */
export const parseSeverity = (raw: string): Severity =>
  (['clear', 'advisory', 'warning', 'critical'] as const).includes(raw as Severity) ? (raw as Severity) : 'advisory';

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, pill: 999 };
