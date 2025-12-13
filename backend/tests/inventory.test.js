const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let userToken;
let adminToken;
let sweetId;

beforeAll(async () => {
  // 1. Cleanup
  await prisma.purchase.deleteMany();
  await prisma.sweet.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Admin (For Restocking)
  await request(app).post('/api/auth/register').send({
    email: 'admin@inventory.com',
    password: 'password123',
    isAdmin: true
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@inventory.com',
    password: 'password123'
  });
  adminToken = adminLogin.body.token;

  // 3. Create User (For Purchasing)
  await request(app).post('/api/auth/register').send({
    email: 'user@inventory.com',
    password: 'password123',
    isAdmin: false
  });
  const userLogin = await request(app).post('/api/auth/login').send({
    email: 'user@inventory.com',
    password: 'password123'
  });
  userToken = userLogin.body.token;

  // 4. Create a Sweet (Initial Stock: 10)
  const sweetRes = await request(app).post('/api/sweets')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Stock Test Sweet', category: 'Test', price: 5.00, quantity: 10 });
  sweetId = sweetRes.body.id;
}, 30000);

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Inventory Operations', () => {

  // TEST 1: PURCHASE (Success)
  it('should decrease quantity when user purchases a sweet', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 3 });

    expect(res.statusCode).toEqual(200);
    // Should return success message and potentially the purchase record
    expect(res.body.message).toMatch(/successful/i);

    // Verify DB: Stock should be 10 - 3 = 7
    const updatedSweet = await prisma.sweet.findUnique({ where: { id: sweetId } });
    expect(updatedSweet.quantity).toEqual(7);
  }, 30000);

  // TEST 2: PURCHASE (Fail - Not Enough Stock)
  it('should deny purchase if requested quantity exceeds stock', async () => {
    // Current stock is 7. Try to buy 100.
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 100 });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/insufficient/i);
  }, 30000);

  // TEST 3: RESTOCK (Success - Admin Only)
  it('should increase quantity when admin restocks', async () => {
    // Current stock is 7. Add 20.
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 20 });

    expect(res.statusCode).toEqual(200);

    // Verify DB: Stock should be 7 + 20 = 27
    const updatedSweet = await prisma.sweet.findUnique({ where: { id: sweetId } });
    expect(updatedSweet.quantity).toEqual(27);
  }, 30000);

  // TEST 4: RESTOCK (Security - User denied)
  it('should forbid non-admins from restocking', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('Authorization', `Bearer ${userToken}`) // User Token
      .send({ quantity: 50 });

    expect(res.statusCode).toEqual(403); // Forbidden
  }, 30000);

});