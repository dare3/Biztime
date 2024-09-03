// app.js
const express = require('express');
const app = express();
const companyRoutes = require('./routes/companies');
const invoiceRoutes = require('./routes/invoices');
const industryRoutes = require('./routes/industries');

app.use(express.json()); // Middleware to parse JSON bodies
app.use('/companies', companyRoutes); // Companies routes
app.use('/invoices', invoiceRoutes); // Invoices routes
app.use('/industries', industryRoutes); // Industries routes

app.listen(3001, () => {
  console.log('Server running on port 3000');
});
