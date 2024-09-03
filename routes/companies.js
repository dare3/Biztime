// routes/companies.js
const express = require('express');
const router = new express.Router();
const db = require('../db');
const slugify = require('slugify');

// GET /companies - list all companies
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT code, name FROM companies');
    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});

// routes/companies.js
// Updated GET /companies/[code] route
router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    // Fetch company details
    const companyResult = await db.query(
      'SELECT code, name, description FROM companies WHERE code = $1',
      [code]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Fetch associated invoices
    const invoiceResult = await db.query(
      'SELECT id FROM invoices WHERE comp_code = $1',
      [code]
    );

    // Fetch associated industries
    const industryResult = await db.query(
      `SELECT i.industry
       FROM industries AS i
       JOIN companies_industries AS ci ON i.code = ci.industry_code
       WHERE ci.comp_code = $1`,
      [code]
    );

    const company = companyResult.rows[0];
    const invoices = invoiceResult.rows.map(inv => inv.id);
    const industries = industryResult.rows.map(ind => ind.industry);

    // Return company details with associated invoices and industries
    return res.json({
      company: {
        ...company,
        invoices,
        industries,
      },
    });
  } catch (err) {
    return next(err);
  }
});


// POST /companies - add a new company
router.post('/', async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
      [code, name, description]
    );

    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// POST /companies - add a new company (updated)
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, { lower: true });
    const result = await db.query(
      'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
      [code, name, description]
    );

    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PUT /companies/[code] - update an existing company
router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const result = await db.query(
      'UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description',
      [name, description, code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// DELETE /companies/[code] - delete a company
router.delete('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query(
      'DELETE FROM companies WHERE code = $1 RETURNING code',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
