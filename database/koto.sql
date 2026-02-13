-- Create database
CREATE DATABASE IF NOT EXISTS koto;

USE koto;

-- Create phrases table
CREATE TABLE IF NOT EXISTS phrases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  usage_count INT DEFAULT 0
);

-- Insert sample phrases
INSERT INTO phrases (text) VALUES
('I need food'),
('I need water'),
('I need help'),
('Yes'),
('No'),
('I am hungry'),
('I am thirsty'),
('Please help me'),
('Thank you'),
('I need to go to the bathroom'),
('I feel pain'),
('I am cold'),
('I am hot'),
('I want to sleep'),
('I need medicine'),
('Call my family'),
('I am happy'),
('I am sad'),
('Stop'),
('Go'),
('Hello'),
('Goodbye'),
('How are you?'),
('I love this'),
('Please wait'),
('Call to 102'),
('Call to amma'),
('Call to relation'),
('I need doctor'),
('I need nurse'),
('I am tired'),
('I want to eat'),
('I want to drink'),
('Please come'),
('I am fine'),
('Thank you very much'),
('Sorry'),
('Please'),
('Help me please'),
('Emergency'),
('Call police'),
('Call ambulance'),
('I need rest'),
('I am sick'),
('I feel good'),
('I want to talk'),
('Listen to me'),
('I understand'),
('I don\'t understand'),
('Repeat please'),
('Slowly please');

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  disability_type VARCHAR(50) NOT NULL,
  caregiver_name VARCHAR(255) NOT NULL,
  caregiver_relation VARCHAR(100) NOT NULL,
  caregiver_phone1 VARCHAR(20) NOT NULL,
  caregiver_phone2 VARCHAR(20),
  caregiver_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Insert sample login credentials
INSERT INTO users (username, password, disability_type, caregiver_name, caregiver_relation, caregiver_phone1, caregiver_phone2, caregiver_email) VALUES
('john_blind', 'password123', 'visual', 'Sarah Johnson', 'Mother', '9876543210', '9876543211', 'sarah.johnson@email.com'),
('priya_hearing', 'secure456', 'hearing', 'Amit Sharma', 'Father', '8765432109', '8765432108', 'amit.sharma@email.com'),
('alex_speech', 'talk789', 'speech', 'Emma Wilson', 'Sister', '7654321098', '7654321097', 'emma.wilson@email.com'),
('multi_user', 'access123', 'multiple', 'David Brown', 'Caregiver', '6543210987', '6543210986', 'david.brown@email.com');