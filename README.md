# SweetShop 🍭

A modern, full-stack Single Page Application (SPA) for ordering handcrafted sweets. This project demonstrates a robust e-commerce flow with role-based authentication (User/Admin), real-time inventory management, and a high-performance frontend state architecture.

## 🚀 Features

### for Users

  * **Visual Discovery:** Browse sweets with a responsive, glassmorphism-inspired UI.
  * **Smart Search & Filter:** Instant client-side filtering by category and price range, combined with backend text search.
  * **Inventory Awareness:** Real-time stock indicators (e.g., "5 left", "Out of Stock").
  * **Purchasing System:** Interactive purchase flow with quantity selection and total cost calculation.

### for Admins

  * **Secure Dashboard:** Protected routes accessible only to users with `isAdmin` privileges.
  * **Inventory Management:**
      * **Add Sweets:** Upload product images directly to Cloudinary via a seamless modal interface.
      * **Restock:** specialized modal to increment stock levels without overwriting data.
      * **Manage Products:** Delete or update sweet details.

## 🛠️ Tech Stack

**Frontend:**

  * **React 19 (Vite):** Latest fast-refresh build tool.
  * **Jotai:** Atomic state management (migrated from Recoil for React 19 compatibility).
  * **Tailwind CSS:** Utility-first styling for the dark-mode aesthetic.
  * **Framer Motion:** Smooth animations for modals and page transitions.
  * **Lucide React:** Modern SVG iconography.

**Backend:**

  * **Node.js & Express:** RESTful API architecture.
  * **Prisma ORM:** Type-safe database queries.
  * **PostgreSQL:** Relational database for Users, Sweets, and Transactions.
  * **Cloudinary:** Cloud storage for product image management.
  * **Multer:** Middleware for handling `multipart/form-data` uploads.

-----

## ⚙️ Setup & Installation

### Prerequisites

  * Node.js (v18+)
  * PostgreSQL installed locally or a cloud instance (e.g., Supabase/Neon).
  * Cloudinary Account (for image uploads).

### 1\. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sweetshop"
JWT_SECRET="your_super_secret_key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

Run migrations and start the server:

```bash
npx prisma migrate dev --name init
npm start
# Server runs on http://localhost:5000
```

### 2\. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

-----

## 🤖 My AI Usage

This project was built using **Gemini** as a technical thought partner to accelerate development while I maintained control over the core architecture and business logic.

### Tools Used

  * **Gemini (Google):** Used for debugging complex dependency issues and generating boilerplate UI components.

### How I Used AI

  * **State Management Migration:** I initially architected the app using Recoil. When I encountered compatibility issues with React 19 (the "White Screen of Death"), I used AI to analyze the dependency conflict. Instead of downgrading React as suggested by standard forums, I directed the AI to help me migrate the entire state layer to **Jotai**, keeping my modern stack intact.
  * **Backend Logic Refinement:** I used AI to generate the specific `streamUpload` helper function for Cloudinary, as handling memory buffers with `multer` is boilerplate-heavy. I then integrated this into my custom controller logic.
  * **Debugging Database Transactions:** When implementing the Inventory system, I encountered Prisma errors regarding type mismatches (e.g., `Argument increment is missing`). I used AI to identify that the request body was passing strings instead of integers, and I implemented the necessary parsing logic in the controller based on its analysis.
  * **UI Animation:** I asked the AI to provide `framer-motion` variants for the modal entry/exit animations to achieve a polished "glassmorphism" look without spending hours tweaking CSS keyframes manually.

### Reflection

AI significantly improved my velocity, particularly in debugging obscure error messages (like the Vite cache corruption issues). However, it did not replace my engineering judgment. For example, when the AI suggested simple solutions that compromised the UX (like removing the image upload feature to save time), I rejected them and enforced a strict requirement for a complete feature set. I treated AI as a junior developer: I assigned it specific tasks (create a modal, write a query), reviewed the code for errors, and integrated it into my larger system design. This allowed me to focus on the high-level data flow and security aspects of the application.
