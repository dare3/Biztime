// tests/industries.test.js
const request = require('supertest');
const app = require('../app');
const db = require('../db');

// Set up initial data for testing
beforeAll(async () => {
  await db.query('DELETE FROM industries');
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM companies_industries');

  await db.query(
    `INSERT INTO industries (code, industry) 
     VALUES ('tech', 'Technology')`
  );
  await db.query(
    `INSERT INTO companies (code, name, description) 
     VALUES ('apple', 'Apple', 'Tech Company')`
  );
  await db.query(
    `INSERT INTO companies_industries (comp_code, industry_code) 
     VALUES ('apple', 'tech')`
  );
});

// Close the database connection after tests
afterAll(async () => {
  await db.end();
});

describe('GET /industries', () => {
  test('Get a list of industries', async () => {
    const res = await request(app).get('/industries');
    expect(res.statusCode).toBe(200);
    expect(res.body.industries[0]).toHaveProperty('code', 'tech');
    expect(res.body.industries[0]).toHaveProperty('industry', 'Technology');
    expect(res.body.industries[0].companies).toContain('apple');
  });
});

describe('POST /industries', () => {
  test('Create a new industry', async () => {
    const res = await request(app).post('/industries').send({
      code: 'mktg',
      industry: 'Marketing',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.industry).toHaveProperty('code', 'mktg');
    expect(res.body.industry).toHaveProperty('industry', 'Marketing');
  });
});

describe('POST /industries/:code/companies', () => {
  test('Associate a company with an industry', async () => {
    const res = await request(app)
      .post('/industries/tech/companies')
      .send({ comp_code: 'apple' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ status: 'Company associated with industry' });
  });

  test('Responds with 400 for existing association', async () => {
    const res = await request(app)
      .post('/industries/tech/companies')
      .send({ comp_code: 'apple' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Association already exists');
  });
});
