// routes/industries.js
const express = require('express');
const router = new express.Router();
const db = require('../db');

// GET /industries - list all industries
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT i.code, i.industry, 
              json_agg(c.code) AS companies 
       FROM industries AS i
       LEFT JOIN companies_industries AS ci ON i.code = ci.industry_code
       LEFT JOIN companies AS c ON ci.comp_code = c.code
       GROUP BY i.code`
    );

    return res.json({ industries: result.rows });
  } catch (err) {
    return next(err);
  }
});

// POST /industries - add a new industry
router.post('/', async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const result = await db.query(
      'INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry',
      [code, industry]
    );

    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// POST /industries/:code/companies - associate a company with an industry
router.post('/:industryCode/companies', async (req, res, next) => {
  try {
    const { industryCode } = req.params;
    const { comp_code } = req.body;

    // Check if the association already exists
    const checkAssociation = await db.query(
      `SELECT * FROM companies_industries 
       WHERE comp_code = $1 AND industry_code = $2`,
      [comp_code, industryCode]
    );

    if (checkAssociation.rows.length > 0) {
      return res.status(400).json({ error: 'Association already exists' });
    }

    // Associate company with industry
    await db.query(
      `INSERT INTO companies_industries (comp_code, industry_code) 
       VALUES ($1, $2)`,
      [comp_code, industryCode]
    );

    return res.status(201).json({ status: 'Company associated with industry' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
