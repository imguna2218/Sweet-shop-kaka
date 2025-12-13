//const { PrismaClient } = require('@prisma/client');
//const prisma = new PrismaClient();
//
//// Public/Protected: List all sweets
//exports.getAllSweets = async (req, res) => {
//  try {
//    const sweets = await prisma.sweet.findMany();
//    res.json(sweets);
//  } catch (error) {
//    res.status(500).json({ error: error.message });
//  }
//};
//
//// Admin Only: Add a new sweet
//exports.createSweet = async (req, res) => {
//  try {
//    const { name, category, price, quantity } = req.body;
//
//    // Basic validation
//    if (!name || !category || !price || quantity === undefined) {
//      return res.status(400).json({ message: 'All fields are required' });
//    }
//
//    const newSweet = await prisma.sweet.create({
//      data: {
//        name,
//        category,
//        price: parseFloat(price), // Ensure decimal compatibility
//        quantity: parseInt(quantity)
//      }
//    });
//
//    res.status(201).json(newSweet);
//  } catch (error) {
//    res.status(500).json({ error: error.message });
//  }
//};