# Markdown Support in Document Summaries

This document explains the markdown formatting capabilities now supported in document summaries displayed in the NFRS Assistant frontend.

## Supported Markdown Features

The following markdown features are now properly styled and rendered in document summaries:

### Text Formatting

- **Bold** text using `**bold**`
- *Italic* text using `*italic*`
- ~~Strikethrough~~ using `~~strikethrough~~`

### Headers

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

### Lists

#### Unordered Lists

```markdown
- Item 1
- Item 2
  - Nested item 1
  - Nested item 2
- Item 3
```

#### Ordered Lists

```markdown
1. First item
2. Second item
3. Third item
```

### Code

#### Inline Code

Use backticks for `inline code`.

#### Code Blocks

```javascript
// This is a JavaScript code block
function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price, 0);
}
```

The code blocks now feature syntax highlighting for various languages. Simply specify the language after the opening triple backticks, like:

    ```javascript
    // Code here
    ```

### Tables

Tables must have proper line breaks between rows and spaces between cell content:

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

Example of a balance sheet formatted as a table:

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

### Blockquotes

```markdown
> This is a blockquote.
>
> It can span multiple lines.
```

### Links

```markdown
[Link text](https://example.com)
```

### Horizontal Rules

```markdown
---
```

## Implementation Details

- Markdown rendering is handled by `react-markdown` library
- Code highlighting is provided by `rehype-highlight`
- Security is enforced with `rehype-sanitize`
- Styling is implemented with styled-components in `MessageList.tsx`
- Table formatting is automatically corrected for better display

## Detailed Guides

For more detailed guidance on specific markdown features:

- [Table Formatting Guide](./table-formatting.md) - Detailed instructions for creating well-formatted tables
- [Financial Statement Examples](./financial-statement-examples.md) - Templates for balance sheets, income statements, and cash flow statements

## Testing

You can test markdown rendering using the sample document provided in `src/test-markdown-format.md`. Upload this as a test document to verify that all markdown features are rendered correctly.
