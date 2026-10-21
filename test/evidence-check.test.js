const test = require('node:test');
const assert = require('node:assert/strict');
const { validateExtraction } = require('../src/evidence-check');

const validPayload = {
  documentType: 'commercial policy',
  workflow: 'policy review',
  fields: [
    {
      name: 'general liability limit',
      value: '$1,000,000',
      confidence: 0.94,
      reviewStatus: 'auto_accept',
      citations: [
        {
          sourceId: 'policy.pdf',
          page: 4,
          quote: 'General Liability Each Occurrence Limit: $1,000,000'
        }
      ]
    }
  ]
};

test('accepts a cited extraction', () => {
  const result = validateExtraction(validPayload);
  assert.equal(result.ok, true);
  assert.deepEqual(result.issues, []);
});

test('rejects a field without citations', () => {
  const payload = structuredClone(validPayload);
  payload.fields[0].citations = [];
  const result = validateExtraction(payload);
  assert.equal(result.ok, false);
  assert.match(result.issues.join('\n'), /at least one citation/i);
});

test('requires human review for low confidence output', () => {
  const payload = structuredClone(validPayload);
  payload.fields[0].confidence = 0.72;
  payload.fields[0].reviewStatus = 'auto_accept';
  const result = validateExtraction(payload);
  assert.equal(result.ok, false);
  assert.match(result.issues.join('\n'), /needs_review/);
});

test('rejects a citation quote that does not support the value', () => {
  const payload = structuredClone(validPayload);
  payload.fields[0].citations[0].quote = 'Workers compensation limit: $500,000';
  const result = validateExtraction(payload);
  assert.equal(result.ok, false);
  assert.match(result.issues.join('\n'), /does not contain the extracted value/i);
});
