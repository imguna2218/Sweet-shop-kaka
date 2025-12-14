const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cloudinary = require('../config/cloudinary');
// Public/Protected: List all sweets
exports.getAllSweets = async (req, res) => {
  try {
    const sweets = await prisma.sweet.findMany();
    res.json(sweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Only: Add a new sweet
const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "sweets_shop" }, // Folder name in Cloudinary
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.write(fileBuffer);
    stream.end();
  });
};

exports.createSweet = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    // 1. Validation
    if (!name || !category || !price || quantity === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let finalImageUrl = "https://placehold.co/400x300?text=No+Image";

    // 2. Handle Image Upload (If file exists)
    if (req.file) {
      try {
        const result = await streamUpload(req.file.buffer);
        finalImageUrl = result.secure_url; // The link from Cloudinary
      } catch (uploadError) {
        console.error("Cloudinary Error:", uploadError);
        return res.status(500).json({ message: 'Image upload failed' });
      }
    }

    // 3. Save to Database
    const newSweet = await prisma.sweet.create({
      data: {
        name,
        category,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        imageUrl: finalImageUrl
      }
    });

    res.status(201).json(newSweet);
  } catch (error) {
    console.error("Create Sweet Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Search sweets by name, category, or price range
exports.searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    // Build the dynamic filter
    const where = {};

    if (name) {
      // "contains" looks for the substring, "mode: insensitive" ignores case (e.g., "cake" matches "Cake")
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const sweets = await prisma.sweet.findMany({ where });
    res.json(sweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Only: Update a sweet
exports.updateSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;

    const updatedSweet = await prisma.sweet.update({
      where: { id: id },
      data: {
        name,
        category,
        // Only update if provided; ensure correct types
        price: price ? parseFloat(price) : undefined,
        quantity: quantity ? parseInt(quantity) : undefined,
        imageUrl,
      }
    });

    res.json(updatedSweet);
  } catch (error) {
    // P2025 is Prisma's error code for "Record not found"
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Sweet not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Admin Only: Delete a sweet
exports.deleteSweet = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sweet.delete({
      where: { id: id }
    });
    res.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Sweet not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// User: Purchase a sweet
exports.purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body; // Read quantity from frontend

    // Default to 1 if not sent, but ensure it's a number
    const amountToPurchase = parseInt(quantity) || 1;

    if (amountToPurchase < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check current stock
      const sweet = await tx.sweet.findUnique({ where: { id } });

      if (!sweet) throw new Error('Sweet not found');

      if (sweet.quantity < amountToPurchase) {
        throw new Error(`Insufficient stock. Only ${sweet.quantity} left.`);
      }

      // 2. Decrement
      return await tx.sweet.update({
        where: { id },
        data: { quantity: { decrement: amountToPurchase } }
      });
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin Only: Restock a sweet
exports.restockSweet = async (req, res) => {
  try {
    const { id } = req.params;
    // FIX: Fallback to 10 if undefined, ensure Int
    const amt = parseInt(req.body.amount) || 10;

    const sweet = await prisma.sweet.update({
      where: { id },
      data: { quantity: { increment: amt } } // amt is now guaranteed to be an Int
    });
    res.json(sweet);
  } catch (error) {
    console.error("Restock Error:", error);
    res.status(500).json({ error: error.message });
  }
};