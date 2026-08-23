# Arcane E-Commerce Platform

A full-stack, modern e-commerce platform built with Next.js, Express, and MongoDB.

## Live Demo

🔗 **App:** https://arcane-ecommerce-app.vercel.app/
⭐ **GitHub:** https://github.com/HassanBhatti22/Arcane-EcommerceApp

---
## What It Does

This platform provides a complete e-commerce experience, including:

- **User Authentication:** Secure signup and login using JWT.
- **Product Browsing & Management:** Browse products, categories, and manage them (admin).
- **Shopping Cart & Checkout:** Add items to cart and checkout seamlessly.
- **Payment Integration:** Secure payments powered by Stripe.
- **Order Tracking:** Users can view their order history and track statuses.

---

## Features

- **Modern UI:** Built with Next.js, Tailwind CSS, and Shadcn UI components for a sleek and responsive design.
- **Secure Backend:** Express.js REST API with JWT authentication and secure password hashing.
- **Database:** MongoDB for flexible and scalable data storage, managed via Mongoose.
- **Image Uploads:** Cloudinary integration for robust product image management.
- **Email Notifications:** Nodemailer integration for order updates and communication.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + React 19 |
| Styling | Tailwind CSS + Radix UI / Shadcn UI |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| File Storage | Cloudinary + Multer |
| Payments | Stripe |
| Form Validation | React Hook Form + Zod |
| Icons | Lucide React |

---

## Project Structure
```
d:\ecommerce-app\
├── Frontend/                  # Next.js Application
│   ├── app/                   # Next.js App Router pages and layouts
│   ├── components/            # Reusable UI components (Shadcn, custom)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and configurations
│   ├── public/                # Static assets
│   ├── styles/                # Global CSS and Tailwind directives
│   └── package.json
├── arcane-backend/            # Express.js REST API
│   ├── config/                # Database and environment configurations
│   ├── controllers/           # Route logic and handlers
│   ├── Middleware/            # Authentication and validation middlewares
│   ├── models/                # Mongoose database schemas
│   ├── routes/                # API route definitions
│   ├── utils/                 # Helper functions
│   ├── index.js               # Entry point for the server
│   └── package.json
└── README.md
```

---

## Local Setup

### Backend (arcane-backend)
```bash
cd arcane-backend
npm install
```

Configure your `arcane-backend/.env` file with the necessary environment variables (MongoDB URI, JWT Secret, Cloudinary credentials, and Stripe keys).
```bash
npm run dev
```

### Frontend (Frontend)
```bash
cd Frontend
npm install
```

Configure your `Frontend/.env.local` file with the necessary environment variables (API URL and Stripe Publishable Key).
```bash
npm run dev
```

Open `http://localhost:3000`

---

## Built By

**Hassan Bhatti**
🔗 GitHub: [@HassanBhatti22](https://github.com/HassanBhatti22)

---

⭐ Star this repo if you found it useful
