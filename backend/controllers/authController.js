//const { PrismaClient } = require('@prisma/client');
//const bcrypt = require('bcryptjs');
//
//const prisma = new PrismaClient();
//
//exports.register = async (req, res) => {
//  try {
//    const { email, password, isAdmin } = req.body;
//
//    // 1. Check if user already exists
//    const existingUser = await prisma.user.findUnique({
//      where: { email: email }
//    });
//
//    if (existingUser) {
//      return res.status(400).json({ message: 'User already exists' });
//    }
//
//    // 2. Hash the password (Security Best Practice)
//    // Salt logic: 10 rounds is standard balance between speed and security
//    const hashedPassword = await bcrypt.hash(password, 10);
//
//    // 3. Create the user in the database
//    const newUser = await prisma.user.create({
//      data: {
//        email,
//        password: hashedPassword,
//        isAdmin: isAdmin || false // Default to false if not sent
//      }
//    });
//
//    // 4. Send success response (Exclude password from response!)
//    res.status(201).json({
//      message: 'User registered successfully',
//      user: {
//        id: newUser.id,
//        email: newUser.email,
//        isAdmin: newUser.isAdmin
//      }
//    });
//
//  } catch (error) {
//    console.error(error);
//    res.status(500).json({ message: 'Server error', error: error.message });
//  }
//};