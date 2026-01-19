# Campus Lost & Found System

A full-stack web application that helps users report lost and found items on campus and automatically match them using intelligent comparison logic. Users can securely claim items after authenticating with Google.

---

## 🚀 Features

- Report lost items with details
- Report found items with optional image upload
- Automatic item matching with confidence scoring
- Secure Google OAuth authentication
- Only authenticated users can claim items
- Proof-based claim verification
- Clean, minimal, trust-focused UI

---

## 🧱 Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS
- React Toastify

### Backend
- Next.js API Routes
- MongoDB
- Mongoose
- JWT Authentication
- Google OAuth 2.0

---

## 🔐 Authentication Flow

- Users authenticate using Google OAuth
- A user record is created on first login
- A JWT session token is stored in an HTTP-only cookie
- Protected API routes verify authentication before processing requests

---

## 🧠 Claim Logic

1. User clicks **“This is mine”**
2. If not logged in:
   - Backend returns `401 Unauthorized`
   - User is redirected to Google login
3. After login:
   - User returns to Matches page
   - User can submit proof of ownership
4. Claim proof is validated using keyword overlap
5. Item status is updated when claim is accepted

---

## 📁 Project Structure

app/
├─ api/
│ ├─ google/
│ │ ├─ login/
│ │ │ └─ route.js
│ │ └─ callback/
│ │ └─ route.js
│ ├─ matches/
│ │ ├─ route.js
│ │ └─ claims/
│ │ └─ route.js
│ └─ auth/
├─ matches/
├─ lost/
└─ found/

models/
├─ User.js
├─ Match.js
├─ LostItem.js
└─ FoundItem.js

lib/
└─ db.js

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback

JWT_SECRET=your_jwt_secret


🛠️ Setup & Installation

Clone the repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

npm install
npm run dev
http://localhost:3000

🔒 Security Notes

Authentication is enforced server-side

Claims cannot be submitted without login

JWT is stored in HTTP-only cookies

Proof validation reduces fraudulent claims

📌 Future Improvements

Replace window.prompt with a modal

Add claim history per user

Admin moderation dashboard

Email notifications

Improved NLP-based matching

📄 License

This project is intended for educational and personal use.

👤 Author

Built by Vidhi
