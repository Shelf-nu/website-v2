/**
 * The prompt behind "Let your AI clean up your spreadsheet": a visitor pastes
 * it into ChatGPT, Claude or Gemini with their export, and gets back a CSV the
 * Shelf importer accepts.
 *
 * Every rule here comes from content/knowledge-base/importing-assets-to-shelf-csv-guide.mdx.
 * When the importer changes (a new column, a new custom-field type), update
 * the guide and this prompt together.
 */
export const IMPORT_PROMPT = `I'm moving my equipment list into Shelf (shelf.nu), an asset management app. I've attached my spreadsheet. Turn it into a CSV that Shelf's importer accepts, following these rules exactly.

OUTPUT
- One CSV file, UTF-8, comma-delimited. First row is the header row. One asset per row.
- At most 1,000 rows per file. If there are more, split them into numbered files.
- Wrap any cell that contains a comma, a double quote or a line break in double quotes, and double any quote inside it ("").

COLUMNS
Headers are case-sensitive. Use only these. An unknown header makes Shelf reject the whole file.
- title (required): the asset's name.
- description: free text.
- category, location, kit, assetModel: plain names. Shelf creates any that don't exist yet.
- tags: several labels in one cell, separated by commas, with the whole cell in double quotes, e.g. "audio,portable".
- custodian: the person who has the item, by full name. Never an email address.
- bookable: write no only for items that must never be booked. Otherwise leave it blank.
- imageUrl: a public http(s) link to a photo, only if my data has one.
- valuation: a plain number with a dot for decimals. No currency symbol, no thousands separator, e.g. 1200.50.
- Bulk stock (cables, batteries, consumables): type = QUANTITY_TRACKED, quantity = the count (more than 0), consumptionType = ONE_WAY if it gets used up or TWO_WAY if it comes back. Optional: minQuantity (low-stock alert) and unitOfMeasure. Leave type blank for ordinary one-of-a-kind items, and never give a QUANTITY_TRACKED row an assetModel.
- If you fill both kit and custodian, every asset in the same kit must have the same custodian.

CUSTOM FIELDS
For anything that doesn't fit a column above, such as serial numbers, purchase dates, warranty or supplier:
- Header: "cf:Field Name,type:TYPE", in double quotes. TYPE is one of: text, multiline text, option, boolean, date, amount, number.
- date: YYYY-MM-DD only. boolean: yes or no only. amount and number: plain numbers with a dot for decimals.
- Keep the ID from my old tool in a text custom field, e.g. "cf:Old ID,type:text". Don't use it as the id column.

LEAVE OUT
- qrId and barcode columns (barcode_...), unless I tell you I already have Shelf QR codes or use Shelf's Alternative Barcodes add-on.

RULES
- Don't invent or guess data. Leave a cell empty rather than filling it.
- Keep every item. Don't drop rows you're unsure about. Flag them instead.
- Merge different spellings of the same category or location, e.g. "Studio A" and "studio a".

WHEN YOU'RE DONE
1. Give me the CSV, as a downloadable file if you can.
2. Show a short table of how my original columns map to Shelf's.
3. List anything you couldn't map or weren't sure about, with the row number.

I'll upload the file in Shelf under Assets → Import. Full guide: https://www.shelf.nu/knowledge-base/importing-assets-to-shelf-csv-guide`;
