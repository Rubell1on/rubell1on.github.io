const {google} = require('googleapis');

module.exports = {
    getSpreadSheet: function (auth, SPREADSHEET_ID) {
        const sheets = google.sheets({version: 'v4', auth});
        return new Promise((resolve, reject) => {
            sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: 'A1:C',
            }, (err, res) => {
                if (err) reject('The API returned an error: ' + err);
                resolve(res.data.values);
            });
        });
    },
    appendSpreadSheet: function (auth, SPREADSHEET_ID, value, range) {
        const sheets = google.sheets({version: 'v4', auth});
        return new Promise((resolve, reject) => {
            sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range,
                valueInputOption: 'USER_ENTERED',
                resource: {values: [value]},
            }, (err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        });
    }
};