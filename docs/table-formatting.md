# Table Formatting Guidelines for Markdown

When creating tables in markdown for the NFRS Assistant, follow these guidelines to ensure they display correctly.

## Table Formatting Requirements

1. **Always include line breaks** - Each row of the table should be on its own line
2. **Include spaces around cell content** - Add spaces between the pipe characters and your text
3. **Include header separator row** - The row with dashes `---` is required between headers and data rows

## Correct Table Format Example

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
```

## Common Formatting Problems and Solutions

### Problem: Missing Line Breaks

Incorrect:
```
| Header 1 | Header 2 | | Row 1 | Data | | Row 2 | Data |
```

Correct:
```
| Header 1 | Header 2 |
|----------|----------|
| Row 1    | Data     |
| Row 2    | Data     |
```

### Problem: Missing Spaces Around Cell Content

Incorrect:
```
|Header 1|Header 2|
|--------|--------|
|Row 1|Data|
|Row 2|Data|
```

Correct:
```
| Header 1 | Header 2 |
|----------|----------|
| Row 1    | Data     |
| Row 2    | Data     |
```

## Example Tables

### Balance Sheet Example

```markdown
| Assets                      | Amount | Liabilities                | Amount | Equity                    | Amount |
|----------------------------|--------|----------------------------|--------|---------------------------|--------|
| Current Assets             |        | Current Liabilities        |        | Common Stock              |        |
| - Cash and Cash Equivalents | 10,000 | - Accounts Payable         | 5,000  | Retained Earnings         | 15,000 |
| - Accounts Receivable       | 8,000  | - Short-term Debt          | 3,000  | Additional Paid-in Capital| 5,000  |
| Non-Current Assets         |        | Non-Current Liabilities    |        |                           |        |
| - Property, Plant, Equipment| 20,000 | - Long-term Debt           | 10,000 | Total Equity              | 20,000 |
| Total Assets               | 38,000 | Total Liabilities & Equity | 38,000 |                           |        |
```

### Income Statement Example

```markdown
| Income Statement Item     | Amount  |
|--------------------------|---------|
| Revenue                  | 100,000 |
| Cost of Goods Sold       | (60,000)|
| **Gross Profit**         | 40,000  |
| Operating Expenses       |         |
| - Selling Expenses       | (15,000)|
| - Administrative Expenses| (10,000)|
| **Operating Income**     | 15,000  |
| Interest Expense         | (3,000) |
| **Profit Before Tax**    | 12,000  |
| Income Tax               | (3,600) |
| **Net Income**           | 8,400   |
```

## Troubleshooting

If your tables still don't appear correctly:

1. Check that you have blank lines before and after your table
2. Verify that all rows have the same number of columns
3. Make sure you have proper line breaks between each row
4. Ensure you have spaces around the content in each cell

Remember that the NFRS Assistant will now automatically fix minor table formatting issues, but following these guidelines will help ensure your tables display correctly every time.

## Financial Statement Tables

For specific examples of correctly formatted financial statements (Balance Sheet, Income Statement, Cash Flow Statement), please refer to our [Financial Statement Examples](./financial-statement-examples.md) guide.
