function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9.%$]+/g, ' ')
    .trim();
}

function validateCitation(citation, field, index) {
  const issues = [];
  const prefix = `${field.name || 'field'} citation ${index + 1}`;

  if (!citation || typeof citation !== 'object') {
    return [`${prefix}: citation must be an object`];
  }
  if (!Number.isInteger(citation.page) || citation.page < 1) {
    issues.push(`${prefix}: page must be a positive integer`);
  }
  if (!isNonEmptyString(citation.sourceId)) {
    issues.push(`${prefix}: sourceId is required`);
  }
  if (!isNonEmptyString(citation.quote)) {
    issues.push(`${prefix}: quote is required`);
    return issues;
  }
  if (citation.quote.trim().length < 8) {
    issues.push(`${prefix}: quote is too short to verify`);
  }

  const value = normalize(field.value);
  const quote = normalize(citation.quote);
  if (value && quote && !quote.includes(value)) {
    issues.push(`${prefix}: quote does not contain the extracted value`);
  }

  return issues;
}

function validateField(field, index) {
  const issues = [];
  const name = field && field.name;
  const prefix = `field ${index + 1}${isNonEmptyString(name) ? ` (${name})` : ''}`;

  if (!field || typeof field !== 'object') {
    return [`${prefix}: field must be an object`];
  }
  if (!isNonEmptyString(field.name)) {
    issues.push(`${prefix}: name is required`);
  }
  if (!isNonEmptyString(String(field.value || ''))) {
    issues.push(`${prefix}: value is required`);
  }
  if (typeof field.confidence !== 'number' || field.confidence < 0 || field.confidence > 1) {
    issues.push(`${prefix}: confidence must be a number between 0 and 1`);
  }
  if (field.confidence < 0.8 && field.reviewStatus !== 'needs_review') {
    issues.push(`${prefix}: confidence below 0.80 requires reviewStatus needs_review`);
  }
  if (!Array.isArray(field.citations) || field.citations.length === 0) {
    issues.push(`${prefix}: at least one citation is required`);
  } else {
    field.citations.forEach((citation, citationIndex) => {
      issues.push(...validateCitation(citation, field, citationIndex));
    });
  }

  return issues;
}

function validateExtraction(payload) {
  const issues = [];

  if (!payload || typeof payload !== 'object') {
    return ['payload: extraction payload must be an object'];
  }
  if (!isNonEmptyString(payload.documentType)) {
    issues.push('payload: documentType is required');
  }
  if (!isNonEmptyString(payload.workflow)) {
    issues.push('payload: workflow is required');
  }
  if (!Array.isArray(payload.fields) || payload.fields.length === 0) {
    issues.push('payload: fields must be a non-empty array');
  } else {
    payload.fields.forEach((field, index) => {
      issues.push(...validateField(field, index));
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

module.exports = { validateExtraction };
