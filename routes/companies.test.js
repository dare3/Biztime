// tests/companies.test.js
const request = require('supertest');
const app = require('../app');
const db = require('../db');

// Set up initial data for testing
beforeAll(async () => {
  await db.query('DELETE FROM companies');
  await db.query(
    `INSERT INTO companies (code, name, description) 
     VALUES ('apple', 'Apple', 'Tech Company')`
  );
});

// Close the database connection after tests
afterAll(async () => {
  await db.end();
});

describe('GET /companies', () => {
  test('Get a list of companies', async () => {
    const res = await request(app).get('/companies');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies: [{ code: 'apple', name: 'Apple' }],
    });
  });
});

describe('GET /companies/:code', () => {
  test('Get details of a specific company', async () => {
    const res = await request(app).get('/companies/apple');
    expect(res.statusCode).toBe(200);
    expect(res.body.company).toHaveProperty('code', 'apple');
    expect(res.body.company).toHaveProperty('name', 'Apple');
    expect(res.body.company).toHaveProperty('description', 'Tech Company');
    expect(res.body.company).toHaveProperty('invoices');
    expect(res.body.company).toHaveProperty('industries');
  });

  test('Responds with 404 for invalid company code', async () => {
    const res = await request(app).get('/companies/invalid');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /companies', () => {
  test('Create a new company', async () => {
    const res = await request(app).post('/companies').send({
      name: 'Microsoft',
      description: 'Software Company',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.company).toHaveProperty('code', 'microsoft');
    expect(res.body.company).toHaveProperty('name', 'Microsoft');
    expect(res.body.company).toHaveProperty('description', 'Software Company');
  });
});

describe('PUT /companies/:code', () => {
  test('Update a company', async () => {
    const res = await request(app).put('/companies/apple').send({
      name: 'Apple Inc.',
      description: 'Leading Tech Company',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.company).toHaveProperty('name', 'Apple Inc.');
    expect(res.body.company).toHaveProperty('description', 'Leading Tech Company');
  });

  test('Responds with 404 for invalid company code on update', async () => {
    const res = await request(app).put('/companies/invalid').send({
      name: 'Invalid',
      description: 'Does not exist',
    });
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /companies/:code', () => {
  test('Delete a company', async () => {
    const res = await request(app).delete('/companies/apple');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'deleted' });
  });

  test('Responds with 404 for deleting an invalid company code', async () => {
    const res = await request(app).delete('/companies/invalid');
    expect(res.statusCode).toBe(404);
  });
});
