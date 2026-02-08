# 🌾 AgriRent – Agricultural Equipment Rental Platform

AgriRent is a web-based application that helps farmers rent agricultural equipment easily while allowing equipment owners to earn by renting out their machines. Instead of spending a large amount of money on buying farming machinery, farmers can search, view, and rent equipment based on their needs. The platform connects farmers and equipment owners in one simple, user-friendly system with secure authentication and rental management.

## What the Project Does
AgriRent focuses on making agricultural equipment sharing simple and practical. Farmers can browse available equipment, check prices and availability, and place rental requests. Equipment owners can list their machines, manage availability, and track rental history. Users can register, log in, and manage their profiles, while the system securely stores user, equipment, and rental data. The main goal of this project is to reduce farming costs and improve access to modern agricultural tools using technology.

## Technologies Used
Frontend: React.js / Next.js, HTML, CSS, JavaScript  
Backend: Node.js, Express.js  
Database: MySQL  
Other: REST APIs, JWT Authentication

## Project Structure
agrirent
│
├─ frontend
│  ├─ components
│  ├─ pages
│  ├─ services
│  └─ assets
│
├─ backend
│  ├─ controllers
│  ├─ routes
│  ├─ models
│  ├─ middleware
│  └─ config
│
├─ database
│  └─ agrirent.sql
│
├─ uploads
│
├─ README.md
└─ package.json


## How to Run the Project
1. Clone the repository  
   git clone https://github.com/your-username/agrirent.git  
   cd agrirent

2. Backend setup  
   cd backend  
   npm install  
   npm start

3. Frontend setup  
   cd frontend  
   npm install  
   npm run dev

## Database Setup
Create a MySQL database named agrirent, import the SQL file from database/agrirent.sql, and update the database credentials in backend/config/db.js.

## Sample API Endpoints
POST /api/auth/register – Register a new user  
POST /api/auth/login – User login  
GET /api/equipment – Fetch all equipment  
POST /api/equipment – Add new equipment  
POST /api/rent – Rent equipment

## Future Enhancements
Online payment integration, location-based equipment search, rating and review system, mobile app support, and AI-based recommendations.

## License
This project is licensed under the MIT License.

## Author
Thejas M – Full Stack Developer

AgriRent is built with the idea of making farming smarter, affordable, and more accessible through technology.
