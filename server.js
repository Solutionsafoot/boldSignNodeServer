const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;
const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5000', 'https://c2aco875.caspio.com'],
};

app.use(cors(corsOptions));
app.use(express.json());

async function sendDocument(emailAddress, secondParam) {
  try {
    const form = new FormData();
    form.append('DisableExpiryAlert', 'false');
    form.append('ReminderSettings.ReminderDays', '3');
    form.append('BrandId', '');
    form.append('ReminderSettings.ReminderCount', '5');
    form.append('EnableReassign', 'true');
    form.append('Message', 'Please sign this.');
    form.append('Signers', `{\n  "name": "aaron",\n  "emailAddress": "${emailAddress}",\n  "formFields": [\n    {\n      "fieldType": "Signature",\n      "pageNumber": 1,\n      "bounds": {\n        "x": 100,\n        "y": 100,\n        "width": 100,\n        "height": 50\n      },\n      "isRequired": true\n    }\n  ]\n}`);
    form.append('ExpiryDays', '10');
    form.append('EnablePrintAndSign', 'false');
    form.append('AutoDetectFields', 'false');
    form.append('OnBehalfOf', '');
    form.append('EnableSigningOrder', 'false');
    form.append('UseTextTags', 'false');
    form.append('SendLinkValidTill', '');
    
    const pdfBuffer = await fs.readFile('agreement.pdf');
    form.append('Files', pdfBuffer, { filename: 'agreement.pdf', contentType: 'application/pdf' });

    form.append('Title', 'Agreement');
    form.append('HideDocumentId', 'false');
    form.append('EnableEmbeddedSigning', 'false');
    form.append('ExpiryDateType', 'Days');
    form.append('ReminderSettings.EnableAutoReminder', 'false');
    form.append('ExpiryValue', '60');
    form.append('DisableEmails', 'false');
    form.append('DisableSMS', 'false');

    const response = await axios.post(
      'https://api.boldsign.com/v1/document/send',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'accept': 'application/json',
          'X-API-KEY': 'someKeyHere',
        },
      }
    );

    console.log(response.data);
    return response.data; // Return response data
  } catch (error) {
    console.error('Error sending document:', error.message);
    throw error; // Re-throw the error to propagate it to the caller
  }
}

app.post('/fill-and-send-pdf', async (req, res) => {
  try {
    // Extract parameters from request body
    const { firstParam, secondParam } = req.body;
    
    // Use sendDocument function with the provided parameters
    const response = await sendDocument(firstParam, secondParam);

    // Respond with success message and relevant data from sendDocument function
    res.json({ success: true, responseData: response });
  } catch (error) {
    // If there's an error, respond with an error message
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
