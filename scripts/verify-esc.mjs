/**
 * Smoke checks for multi-ESC helpers (mirrors src/lib/esc.ts).
 * Run: node scripts/verify-esc.mjs
 */

const VALID_FORM_FACTORS = new Set(['single', '2-in-1', '4-in-1', '6-in-1', '8-in-1']);
const VALID_CONTROL_TYPES = new Set(['FOC', 'BLHeli_32', 'AM32', 'BLDC', 'other']);

function parseEscSpecs(raw) {
  if (!raw || typeof raw !== 'object') return undefined;
  const channels = Number(raw.channels);
  if (!Number.isFinite(channels) || channels < 1) return undefined;
  const formFactor = String(raw.formFactor || '');
  if (!VALID_FORM_FACTORS.has(formFactor)) return undefined;
  const continuousCurrentA = Number(raw.continuousCurrentA);
  if (!Number.isFinite(continuousCurrentA) || continuousCurrentA <= 0) return undefined;
  const voltageRange = String(raw.voltageRange || '').trim();
  if (!voltageRange) return undefined;
  const controlType = String(raw.controlType || '');
  if (!VALID_CONTROL_TYPES.has(controlType)) return undefined;
  return {
    channels,
    formFactor,
    continuousCurrentA,
    voltageRange,
    controlType,
    bec: Boolean(raw.bec),
  };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const multi = parseEscSpecs({
  channels: 4,
  formFactor: '4-in-1',
  continuousCurrentA: 80,
  voltageRange: '4-8S',
  controlType: 'AM32',
  bec: false,
});
assert(multi && multi.channels === 4, 'expected 4-in-1 parse');
assert(multi.formFactor === '4-in-1', 'expected form factor');

assert(
  parseEscSpecs({
    channels: 1,
    formFactor: 'single',
    continuousCurrentA: 60,
    voltageRange: '6-24S',
    controlType: 'FOC',
    bec: false,
  })?.channels === 1,
  'expected single ESC parse',
);

assert(
  parseEscSpecs({
    channels: 4,
    formFactor: '9-in-1',
    continuousCurrentA: 60,
    voltageRange: '6S',
    controlType: 'FOC',
  }) === undefined,
  'invalid form factor should fail',
);

assert(parseEscSpecs(null) === undefined, 'null should fail');

console.log('verify-esc: all checks passed (multi-ESC + single ESC)');
