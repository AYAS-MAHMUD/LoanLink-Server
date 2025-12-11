# LoanLink (Server)

**Project:** LoanLink — Microloan Request & Approval Tracker System (Backend)  
**Purpose:** REST API এবং business logic (users, loans, loanApplications, payments), JWT/session verification, Stripe webhook, Firebase token verification, এবং MongoDB persistence.

**Live URL (API Base):** 

---

## Key Features
- User management (register via frontend Firebase flow, role management, suspend with reason)  
- Loan CRUD (create/update/delete/list, showOnHome toggle)  
- Loan Application CRUD (apply, approve, reject, cancel)  
- Payment handling with Stripe (create checkout session, webhook to confirm payment)  
- Protected routes with Firebase ID token verification 
- Pagination, Search & Filter endpoints (for loans and applications)  
- Admin / Manager / Borrower role based authorization

---

## Tech Stack & Major Packages
- Node.js + Express  
- MongoDB Atlas + Mongoose  
- Firebase Admin SDK (verify ID tokens)  
- stripe (Stripe Node SDK)  
- dotenv, cors, cookie-parser, express-validator, helmet (security)  
- nodemon (dev)

**Example install**

### 1️⃣ Clone the repository
- 1. git clone YOUR_SERVER_REPO_LINK
### 2️⃣ Go to the server folder
- 2. cd server
### 3️⃣ Install dependencies
- 3. npm install
### 5️⃣ Start the server
- 4. npm run start / nodemon index.js


⭐ Important Notes
You must add your client domain to Firebase Authentication → Authorized Domains.
You must add your live frontend URL into backend CORS allowed origins.
Without .env, the project will NOT run.


🙏 Thanks for Visiting This Project!
If you want to run this project locally:
👉 Clone both client & server using the instructions above.
👉 Add the required .env files.
👉 Start both servers.
Feel free to ⭐ star the repo if you like the project!
For any issue, feel free to open a Pull Request or Issue.