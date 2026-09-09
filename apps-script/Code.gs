/**
 * TANVO — project inquiry endpoint.
 * Appends each submission from the site's "Start a project" form to a Google
 * Sheet and emails the team so nobody has to watch the spreadsheet.
 *
 * ---------------------------------------------------------------------------
 * DEPLOY
 * ---------------------------------------------------------------------------
 * 1. Create a Google Sheet. Its tab name must match SHEET_NAME below.
 *    Leave it empty — the header row is written automatically on first write.
 * 2. In that Sheet: Extensions → Apps Script. Paste this file over Code.gs.
 * 3. Set SHARED_SECRET below to any random string, then put the SAME string in
 *    VITE_ENQUIRY_SECRET in .env.
 * 4. Deploy → New deployment → type "Web app".
 *       Execute as:      Me
 *       Who has access:  Anyone          ← must be "Anyone", not "Anyone with Google account"
 * 5. Authorise when prompted (it needs Sheets + Gmail on your account).
 * 6. Copy the /exec URL into VITE_ENQUIRY_ENDPOINT in .env.
 *
 * After ANY edit here you must Deploy → Manage deployments → edit → "New
 * version". Saving alone does not update the live /exec URL. This is the
 * single most common reason a working form suddenly stops working.
 * ---------------------------------------------------------------------------
 */

const SHEET_NAME = 'Inquiries';
// Keep the real value only in the Apps Script editor and in .env (gitignored).
// This repo is public: a literal here is trivially greppable by bots.
const SHARED_SECRET = 'PASTE_YOUR_SHARED_SECRET_HERE';
const NOTIFY_EMAIL = 'support@tanvo.in';   // set to '' to disable notifications

const HEADERS = [
  'Timestamp', 'Name', 'Email', 'Phone', 'Capabilities', 'Message', 'Page URL', 'Flagged'
];

function doPost(e) {
  // Serialise writes: two visitors submitting at once would otherwise be able
  // to compute the same target row and one would overwrite the other.
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json({ status: 'error', message: 'Server busy, please retry.' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ status: 'error', message: 'Empty request body.' });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return json({ status: 'error', message: 'Body was not valid JSON.' });
    }

    if (data.secret !== SHARED_SECRET) {
      return json({ status: 'error', message: 'Rejected.' });
    }

    // Honeypot. Deliberately NOT a hard reject: browser autofill and password
    // managers do sometimes fill hidden inputs, and discarding those would lose
    // real inquiries silently. Record every row, mark the suspicious ones, and
    // skip only the notification email. Filter the Flagged column to review.
    const flagged = data.tv_hp ? 'SPAM?' : '';

    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim();
    const message = String(data.message || '').trim();

    if (!name || !email || !message) {
      return json({ status: 'error', message: 'Name, email and project brief are required.' });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ status: 'error', message: 'That email address does not look valid.' });
    }

    const sheet = getSheet();
    sheet.appendRow([
      new Date(),
      text(name, 200),
      text(email, 200),
      text(data.phone, 60),
      text(data.capabilities, 300),
      text(message, 5000),
      text(data.pageUrl, 500),
      flagged
    ]);

    if (!flagged) notify(name, email, data);
    return json({ status: 'ok' });

  } catch (err) {
    console.error(err);
    return json({ status: 'error', message: 'Could not record the inquiry.' });
  } finally {
    lock.releaseLock();
  }
}

/** Browsers may GET the /exec URL; answer rather than throwing a stack trace. */
function doGet() {
  return json({ status: 'ok', message: 'TANVO inquiry endpoint is live.' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function notify(name, email, data) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'New project inquiry — ' + name,
      replyTo: email,          // hit Reply in Gmail and it goes to the client
      body: [
        'Name:         ' + name,
        'Email:        ' + email,
        'Phone:        ' + (data.phone || '—'),
        'Capabilities: ' + (data.capabilities || '—'),
        '',
        'Brief:',
        data.message || '—',
        '',
        'Submitted from: ' + (data.pageUrl || '—')
      ].join('\n')
    });
  } catch (err) {
    // A failed notification must never lose the row we already wrote.
    console.error('Notification failed: ' + err);
  }
}

/**
 * Sheets parses appended strings as user input, so a value starting with
 * = + - @ becomes a formula: a phone number like "+91 96633 41218" lands as
 * #ERROR! and the number is lost, and "=IMPORTXML(...)" in the brief would
 * actually execute in the sheet. A leading apostrophe marks the value as
 * literal text; it is a marker, not a character, and does not display.
 */
function text(value, limit) {
  const s = String(value == null ? '' : value).slice(0, limit);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
