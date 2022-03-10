const { GoogleSpreadsheet } = require('google-spreadsheet')

const newSheetsClient = async ({ sheetId, email, priKey }) => {
  const doc = new GoogleSpreadsheet(sheetId)

  // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
  await doc.useServiceAccountAuth({
    // env var values are copied from service account credentials generated by google
    // see "Authentication" section in docs for more info
    client_email: email,
    private_key: priKey,
  })

  await doc.loadInfo() // loads document properties and worksheets
  return doc
}

module.exports = {
  newSheetsClient,
}