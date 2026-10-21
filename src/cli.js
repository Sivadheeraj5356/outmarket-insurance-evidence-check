#!/usr/bin/env node
const fs = require('fs');
const { validateExtraction } = require('./evidence-check');

const path = process.argv[2];
if (!path) {
  console.error('Usage: node src/cli.js <extraction.json>');
  process.exit(2);
}

let payload;
try {
  payload = JSON.parse(fs.readFileSync(path, 'utf8'));
} catch (error) {
  console.error(`Could not read extraction JSON: ${error.message}`);
  process.exit(2);
}

const result = validateExtraction(payload);
if (result.ok) {
  console.log('PASS: extraction is review-ready');
} else {
  console.log('FAIL: extraction is not review-ready');
  result.issues.forEach((issue) => console.log(`- ${issue}`));
}
process.exit(result.ok ? 0 : 1);
