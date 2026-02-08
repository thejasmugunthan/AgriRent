AgriRent Backend (Express + MongoDB)
------------------------------------
Endpoints are prefixed with /api

Routes:
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/machines
- POST /api/machines
- etc.

Setup:
1) Create .env with:
   MONGO_URI=mongodb://localhost:27017/agrirent
   JWT_SECRET=change_me

2) Install deps:
   npm i

3) Run:
   npm run dev
