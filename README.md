**Overview**

A full-stack system to manage organ donors, recipients, and allocation. The project focuses on priority-based matching using real-world constraints such as blood compatibility, urgency, and organ expiry time.

**Key Features**

JWT-based user authentication
Donor and recipient management (CRUD operations)
Organ tracking with expiry handling
Priority-based matching using SQL stored procedure
Compatibility filtering based on blood group and urgency

**Tech Stack**

**Frontend:** HTML, Tailwind CSS
**Backend:** Node.js, Express.js
**Database:** MySQL

**Core Logic**

Organ allocation is handled using a stored procedure that selects the best match based on:

Blood group compatibility
Recipient urgency level
Age difference
Organ expiry constraints

**Setup**
git clone <repo-link>
cd <project-folder>
npm install

Create .env:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret

**Run database:**

SOURCE init.sql;

**Start server:**

npm start

**Summary**

This project demonstrates efficient resource allocation using database-driven logic and backend integration, simulating real-world healthcare constraints.
