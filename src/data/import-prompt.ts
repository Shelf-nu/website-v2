/**
 * The prompt behind "Let your AI clean up your spreadsheet": a visitor pastes
 * it into ChatGPT, Claude or Gemini with their export, and gets back a CSV the
 * Shelf importer accepts.
 *
 * Every rule here comes from content/knowledge-base/importing-assets-to-shelf-csv-guide.mdx
 * and the importer's header allow-list (ASSET_CSV_HEADERS in the app). When the
 * importer changes, update the guide and this prompt together.
 *
 * Why it is built this way, not as one instruction: the silent failures are the
 * expensive ones (a day/month swap passes Shelf's checks, a chat answer that
 * types out a long CSV drops rows). So the AI must ask before it guesses, work
 * in code rather than typing the file, and check its own output before handing
 * it over.
 */
export const IMPORT_PROMPT = `I'm moving my equipment list into Shelf (shelf.nu), an asset management app. I've attached my spreadsheet. Help me turn it into a CSV that Shelf's importer accepts.

Work in three steps. Use code (for example Python with the csv module) to read my file and to write the CSV. Don't type the CSV out by hand.

STEP 1: CHECK MY FILE, THEN ASK ME
Before writing anything, reply with:
1. How many items (rows) you found, and in which sheet. If the file has several sheets, ask which ones to use.
2. A table mapping each of my columns to a Shelf column from the list in step 2, or to "leave out".
3. Your questions. Always cover:
- Dates. For each date column, say which format you detected and why (e.g. "row 14 has 25/03/2024, so it's day/month"). If every value would make sense either way, because both numbers are 12 or lower, don't guess: show me three examples and ask. Also ask before converting spreadsheet date numbers (like 45123) or two-digit years.
- Money. Which currency my Shelf workspace uses, and which currency the values in my file are in. Shelf stores every amount in the workspace currency. If the two differ, or the file mixes currencies, ask whether to convert (and at what rate) or leave those cells empty.
- Custom fields. Which columns should become custom fields, and the type you'd give each.
- Bulk stock. Which items are counted rather than tracked one by one (cables, batteries, consumables).
- Merges. Different spellings of the same name ("Studio A", "studio a", "Studio A "). List them and merge only the ones I approve.
- People. If the person column holds emails instead of names, ask me for names, or leave it empty.
- Missing names. List any rows with no item name and ask me what to call them, or whether to leave them out. Shelf needs a title on every row.
- Codes. Whether my items already carry Shelf QR codes from my workspace, and whether my workspace has the Alternative Barcodes add-on switched on.
Then stop and wait for my answers.

STEP 2: WRITE THE CSV
Output:
- UTF-8, comma-delimited. First row is the header row. One item per row.
- At most 1,000 rows per file. Split larger lists into numbered files.
- Wrap any cell that contains a comma, a double quote or a line break in double quotes, and double any quote inside it ("").

Columns. Headers are case-sensitive. Use only these, because an unknown header makes Shelf reject the whole file:
- title (required): the item's name.
- description: free text.
- category, kit, assetModel: plain names. Shelf creates any that don't exist yet.
- location: one place name per item. If my data splits building and room into separate columns, ask me which to use.
- tags: several labels in one cell, separated by commas, with the whole cell in double quotes, e.g. "audio,portable".
- custodian: the person who has the item, by full name. Never an email address.
- bookable: write no only for items that must never be booked. Otherwise leave it blank.
- imageUrl: a public http(s) link to a photo, only if my data has one.
- valuation: a plain number with a dot for decimals. No currency symbol, no thousands separator, e.g. 1200.50.
- type, quantity, consumptionType, minQuantity, unitOfMeasure: for bulk stock only. Set type to QUANTITY_TRACKED, quantity to the count (more than 0), and consumptionType to ONE_WAY if it gets used up or TWO_WAY if it comes back. minQuantity (low-stock alert) and unitOfMeasure are optional. Leave all five blank for ordinary one-of-a-kind items, and never give a QUANTITY_TRACKED row an assetModel.
- If you fill both kit and custodian, every item in the same kit must have the same custodian.

Custom fields, for anything that doesn't fit a column above (serial number, purchase date, warranty, supplier):
- Header: "cf:Field Name,type:TYPE", inside double quotes. TYPE is one of: text, multiline text, option, boolean, date, amount, number.
- date: YYYY-MM-DD only. boolean: yes or no only. amount and number: plain numbers with a dot for decimals.
- Keep the ID from my old tool in "cf:Old ID,type:text", not in an id column.

Codes, only when I confirmed them in step 1:
- qrId: only if my items already carry Shelf QR codes from my workspace that aren't linked to another item yet. Each code once, never shared between items.
- barcode_Code128, barcode_Code39, barcode_DataMatrix, barcode_ExternalQR, barcode_EAN13: only if the Alternative Barcodes add-on is on. Several codes of one type go in one cell, separated by commas, with the cell in double quotes. Code128: 4-40 characters. Code39: 4-43 characters, A-Z and 0-9 only. DataMatrix: 4-100 characters. ExternalQR: up to 2048 characters. EAN13: exactly 13 digits with a valid check digit.
- Otherwise leave these columns out entirely. Shelf creates a new QR code for every item.

Rules:
- Don't invent or guess data. An empty cell is better than a wrong one.
- Keep every item. If you're unsure about a row, keep it and flag it.

STEP 3: CHECK THE FILE BEFORE YOU GIVE IT TO ME
Open the CSV you wrote with a CSV parser and report the result of each check:
- The number of items in my file equals the number of rows in the CSV, or you explain every difference.
- Every header is one of: title, description, category, kit, assetModel, location, tags, custodian, bookable, imageUrl, valuation, type, quantity, consumptionType, minQuantity, unitOfMeasure, a "cf:Name,type:TYPE" header with a type from the list, or (only if I confirmed them in step 1) qrId and the barcode_ headers listed above.
- No row has an empty title, and no qrId or barcode value appears twice.
- Every date is YYYY-MM-DD, every boolean is yes or no, and every valuation, amount and number cell is a plain number.
- Every barcode value fits the length and character rules for its type.
- Every QUANTITY_TRACKED row has a quantity above 0 and a consumptionType, and no assetModel.
- Every item in the same kit has the same custodian.
- No file has more than 1,000 rows.
Then give me the file(s), the final column mapping, and a list of anything you weren't sure about, with row numbers.

I'll upload the file in Shelf under Assets → Import. Full guide: https://www.shelf.nu/knowledge-base/importing-assets-to-shelf-csv-guide`;
