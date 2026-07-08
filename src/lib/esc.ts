import { EscSpecs, Product } from './types';

const VALID_FORM_FACTORS = new Set(['single', '2-in-1', '4-in-1', '6-in-1', '8-in-1']);
const VALID_CONTROL_TYPES = new Set(['FOC', 'BLHeli_32', 'AM32', 'BLDC', 'other']);

/** Normalize and validate optional ESC specs from API / form payloads. */
export function parseEscSpecs(raw: unknown): EscSpecs | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const s = raw as Record<string, unknown>;

  const channels = Number(s.channels);
  if (!Number.isFinite(channels) || channels < 1) return undefined;

  const formFactor = String(s.formFactor || '');
  if (!VALID_FORM_FACTORS.has(formFactor)) return undefined;

  const continuousCurrentA = Number(s.continuousCurrentA);
  if (!Number.isFinite(continuousCurrentA) || continuousCurrentA <= 0) return undefined;

  const voltageRange = String(s.voltageRange || '').trim();
  if (!voltageRange) return undefined;

  const controlType = String(s.controlType || '');
  if (!VALID_CONTROL_TYPES.has(controlType)) return undefined;

  const peakRaw = s.peakCurrentA;
  const peakCurrentA =
    peakRaw === undefined || peakRaw === null || peakRaw === ''
      ? undefined
      : Number(peakRaw);

  return {
    channels,
    formFactor: formFactor as EscSpecs['formFactor'],
    continuousCurrentA,
    peakCurrentA: peakCurrentA !== undefined && Number.isFinite(peakCurrentA) ? peakCurrentA : undefined,
    voltageRange,
    controlType: controlType as EscSpecs['controlType'],
    bec: Boolean(s.bec),
    signalFrequency: s.signalFrequency ? String(s.signalFrequency) : undefined,
    mountingPattern: s.mountingPattern ? String(s.mountingPattern) : undefined,
    firmware: s.firmware ? String(s.firmware) : undefined,
  };
}

export function isMultiEsc(product: Product): boolean {
  return Boolean(product.escSpecs && product.escSpecs.channels > 1);
}

export function formatEscChannels(specs: EscSpecs): string {
  if (specs.formFactor !== 'single') return specs.formFactor;
  return specs.channels === 1 ? 'Single ESC' : `${specs.channels}-channel`;
}

/** Append structured ESC specs to marketplace listing descriptions. */
export function enrichDescriptionWithEscSpecs(product: Product): string {
  const specs = product.escSpecs;
  if (!specs) return product.description;

  const lines = [
    product.description,
    '',
    'ESC Specifications:',
    `- Form factor: ${formatEscChannels(specs)} (${specs.channels} motor channel${specs.channels === 1 ? '' : 's'})`,
    `- Continuous current: ${specs.continuousCurrentA}A per channel`,
  ];
  if (specs.peakCurrentA) {
    lines.push(`- Peak current: ${specs.peakCurrentA}A per channel`);
  }
  lines.push(
    `- Voltage: ${specs.voltageRange}`,
    `- Control: ${specs.controlType}`,
    `- BEC: ${specs.bec ? 'Yes' : 'No'}`,
  );
  if (specs.signalFrequency) lines.push(`- Signal frequency: ${specs.signalFrequency}`);
  if (specs.mountingPattern) lines.push(`- Mounting: ${specs.mountingPattern}`);
  if (specs.firmware) lines.push(`- Firmware: ${specs.firmware}`);

  return lines.join('\n');
}
