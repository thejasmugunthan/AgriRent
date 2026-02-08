CREATE DATABASE IF NOT EXISTS agrirent;
USE agrirent;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  role ENUM('renter','owner') DEFAULT 'renter',
  password_hash VARCHAR(255) NOT NULL,
  photo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Machines
CREATE TABLE IF NOT EXISTS machines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(100),
  base_rate DECIMAL(10,2) DEFAULT 0,
  rent_per_day DECIMAL(10,2) DEFAULT 0,
  location VARCHAR(150),
  available BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Rentals
CREATE TABLE IF NOT EXISTS rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_id INT NOT NULL,
  renter_id INT NOT NULL,
  start_date DATE,
  end_date DATE,
  days INT,
  total DECIMAL(12,2),
  status ENUM('booked','active','completed','cancelled') DEFAULT 'booked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
  FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE CASCADE
);
