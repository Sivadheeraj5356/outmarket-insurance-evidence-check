# Outmarket Insurance Evidence Check

A dependency-free Node.js checker for source-cited insurance document AI workflows.

Outmarket's product surface turns dense broker, carrier, and policy documents into workflow output that brokers can trust. This project checks a synthetic extraction payload before it reaches a user: every material field needs a source citation, each citation needs a page and quote, and low-confidence fields need an explicit human review state.

## Run

```bash
npm test
npm run check
```

The example is synthetic and contains no customer, broker, carrier, or policy data.

## Output

The CLI prints `PASS` when the extraction is review-ready and `FAIL` with specific issues when it is not. It does not infer missing policy facts or repair citations.
