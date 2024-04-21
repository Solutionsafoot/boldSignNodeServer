const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;
const { PDFDocument } = require('pdf-lib');
const { getFormFieldNames } = require('./functions');
const app = express();

const corsOptions = {
  	origin: ['http://localhost:3000', 'http://localhost:5000', 'https://c2aco875.caspio.com'],
};

app.use(cors(corsOptions));
app.use(express.json());

//route for filling in pdf
  // takes a post body like  {  "veteranFirstName": "John",  "veteranLastName": "Doe"} , must have header - Content-Type application/json
  // then fills in pdf with info and saves as Completed2122a.pdf.
app.post('/peg-pdf-fill-and-send', async (req, res) => {

	try {
		// Path to your PDF file
		const pdfFilePath = 'agreement_blank.pdf';
		const pdfOutputFilePath = 'agreement_filled.pdf';
		const requestBody = req.body;

		if (!pdfFilePath || !requestBody) {
			return res.status(400).json({ error: 'Missing required parameters' });
		}

		// Read the existing PDF file
		const dataBuffer = await fs.readFile(pdfFilePath);
		const pdfDoc = await PDFDocument.load(dataBuffer)
		const form = pdfDoc.getForm()

		const getFormFieldNames = async () => {
			// Get all fields from the form
			const fields = form.getFields()
		
			// Extract field names
			const fieldNames = fields.map((field) => field.getName())
		
			return fieldNames
		}

		console.log("field names:", await getFormFieldNames())

		// Log the received metadata
		console.log('Received request body:', req.body);

		const fieldsToFill = [
			{name: "Agreement Date", value: requestBody.agreementDate},
			{name: "Date Signed SA", value: requestBody.dateSignedSA},
			{name: "Full Name", value: requestBody.fullName},
			{name: "Company Name", value: requestBody.companyName},
			{name: "TitlePosition", value: requestBody.titlePosition},
			{name: "Date Signed", value: requestBody.dateSigned}
		]

		// Iterate through the specified fields and fill in text
		for (const field of fieldsToFill) {
			const pdfTextField = form.getTextField(field.name)
			if (pdfTextField) pdfTextField.setText(field.value)
		}

		const pdfBytes = await pdfDoc.save();
		await fs.writeFile(pdfOutputFilePath, pdfBytes);
		console.log('PDF created with filled metadata!');

		// Respond with a success message
		res.status(200).json({
			success: true,
			message: 'PDF filled successfully',
		});
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Failed to fill PDF' });
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});