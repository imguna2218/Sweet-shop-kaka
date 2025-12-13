const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let adminToken;

beforeAll(async () => {
  await prisma.purchase.deleteMany();
  await prisma.sweet.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Admin User
  await request(app).post('/api/auth/register').send({
    email: 'admin@sweetshop.com',
    password: 'password123',
    isAdmin: true
  });

  // 2. Login to get Token
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'admin@sweetshop.com',
    password: 'password123'
  });

  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Sweets Endpoints', () => {

  it('should allow an admin to add a new sweet', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`) // Send the Token!
      .send({
        name: 'Chocolate Lava Cake',
        category: 'Cakes',
        price: 5.50,
        quantity: 20
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual('Chocolate Lava Cake');
  }, 30000);

  it('should retrieve a list of all sweets', async () => {
    const res = await request(app)
      .get('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  }, 30000);

});

describe('Search Functionality', () => {

    // We need to add some dummy data to search for
    beforeAll(async () => {
      // Create a few specific sweets to test filtering
      await request(app).post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Searchable Pie', category: 'Pies', price: 10.00, quantity: 5 });

      await request(app).post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Cheap Candy', category: 'Candy', price: 1.50, quantity: 100 });
    }, 30000); // 30s timeout

    it('should search sweets by name', async () => {
      const res = await request(app)
        .get('/api/sweets/search?name=Searchable')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toContain('Searchable');
    }, 30000);

    it('should filter sweets by price range', async () => {
      const res = await request(app)
        .get('/api/sweets/search?minPrice=0&maxPrice=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      // Should find "Cheap Candy" (1.50) but NOT "Searchable Pie" (10.00)
      const foundHighPrice = res.body.find(s => s.price > 5);
      expect(foundHighPrice).toBeUndefined();
    }, 30000);

});