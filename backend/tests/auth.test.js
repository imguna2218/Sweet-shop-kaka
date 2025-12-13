// backend/tests/auth.test.js
require('dotenv').config(); // Load .env first

const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');

// Connect simply. No complex config objects.
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

// Clean up database before tests run
beforeAll(async () => {
  await prisma.$connect();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth Endpoints', () => {

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        isAdmin: false
      });

    // We EXPECT this to fail with 404 (Not Found)
    // If we see 404, we have won.
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body).toHaveProperty('user');
  });

});