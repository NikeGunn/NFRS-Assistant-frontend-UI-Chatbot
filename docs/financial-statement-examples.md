# Financial Statement Formatting Examples

This document provides examples of correctly formatted financial statements in markdown tables for use in NFRS Assistant document summaries.

## Balance Sheet Example

```markdown
| Assets                        | Amount  | Liabilities & Equity        | Amount  |
|------------------------------|---------|----------------------------|---------|
| **Current Assets**           |         | **Current Liabilities**    |         |
| Cash and Cash Equivalents    | 100,000 | Accounts Payable           | 45,000  |
| Accounts Receivable          | 75,000  | Short-term Debt            | 30,000  |
| Inventory                    | 50,000  | Accrued Expenses           | 25,000  |
| Prepaid Expenses             | 10,000  | Current Portion of LTD     | 20,000  |
| Total Current Assets         | 235,000 | Total Current Liabilities  | 120,000 |
|                              |         |                            |         |
| **Non-Current Assets**       |         | **Non-Current Liabilities**|         |
| Property, Plant, Equipment   | 300,000 | Long-term Debt             | 150,000 |
| Less: Accumulated Deprec.    | (90,000)| Deferred Tax Liabilities   | 25,000  |
| Intangible Assets            | 100,000 | Other Long-term Liabilities| 50,000  |
| Long-term Investments        | 75,000  | Total Non-Current Liab.    | 225,000 |
| Total Non-Current Assets     | 385,000 | **Total Liabilities**      | 345,000 |
|                              |         |                            |         |
|                              |         | **Shareholders' Equity**   |         |
|                              |         | Share Capital              | 100,000 |
|                              |         | Retained Earnings          | 125,000 |
|                              |         | Reserves                   | 50,000  |
|                              |         | Total Shareholders' Equity | 275,000 |
|                              |         |                            |         |
| **Total Assets**             | 620,000 | **Total Liab. & Equity**   | 620,000 |
```

When rendered, this will produce a cleanly formatted balance sheet.

## Income Statement Example

```markdown
| Income Statement                      | Amount     |
|--------------------------------------|------------|
| **Revenue**                          | 500,000    |
| **Cost of Goods Sold**               | (300,000)  |
| **Gross Profit**                     | 200,000    |
|                                      |            |
| **Operating Expenses**               |            |
| Selling, General & Admin Expenses    | (80,000)   |
| Research & Development               | (30,000)   |
| Depreciation & Amortization          | (20,000)   |
| **Total Operating Expenses**         | (130,000)  |
|                                      |            |
| **Operating Income**                 | 70,000     |
|                                      |            |
| Interest Expense                     | (15,000)   |
| Interest Income                      | 5,000      |
| Other Income/(Expense)               | 3,000      |
|                                      |            |
| **Income Before Taxes**              | 63,000     |
| Income Tax Expense                   | (15,750)   |
|                                      |            |
| **Net Income**                       | 47,250     |
|                                      |            |
| **Earnings Per Share**               |            |
| Basic                                | 2.36       |
| Diluted                              | 2.31       |
```

## Cash Flow Statement Example

```markdown
| Cash Flow Statement                        | Amount     |
|-------------------------------------------|------------|
| **Cash Flows from Operating Activities**  |            |
| Net Income                                | 47,250     |
| Adjustments:                              |            |
| - Depreciation & Amortization             | 20,000     |
| - Changes in Working Capital              |            |
|   · Accounts Receivable (Increase)        | (15,000)   |
|   · Inventory (Decrease)                  | 10,000     |
|   · Accounts Payable Increase             | 5,000      |
| **Net Cash from Operating Activities**    | 67,250     |
|                                           |            |
| **Cash Flows from Investing Activities**  |            |
| Purchase of Property & Equipment          | (45,000)   |
| Sale of Investments                       | 20,000     |
| **Net Cash from Investing Activities**    | (25,000)   |
|                                           |            |
| **Cash Flows from Financing Activities**  |            |
| Debt Repayments                           | (20,000)   |
| Dividends Paid                            | (15,000)   |
| **Net Cash from Financing Activities**    | (35,000)   |
|                                           |            |
| **Net Increase in Cash**                  | 7,250      |
| Cash at Beginning of Period               | 92,750     |
| **Cash at End of Period**                 | 100,000    |
```

## Tips for Financial Statement Tables

1. **Use Bold Headings**: Use `**bold**` for section headers to improve readability
2. **Align Numbers**: Keep numbers right-aligned in their cells
3. **Include Empty Rows**: Add empty rows (using `|    |    |`) between sections
4. **Show Negative Numbers**: Use parentheses for negative numbers: `(10,000)`
5. **Maintain Consistency**: Keep column widths consistent throughout the table
6. **Use Indentation**: Use characters like `-` or `·` for hierarchical relationships

These examples follow standard accounting presentation formats while maintaining compatibility with markdown rendering in the NFRS Assistant.
