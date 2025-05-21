# NAWA - School Management System

A comprehensive school management system built with React and Node.js.

## Project Structure

```
NAWA_CLIENT/
├── front_end/     # React frontend application
└── back_end/      # Node.js backend server
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Tejas-Bipu-Shahi/DeployNavaVancer.git
cd DeployNavaVancer
```

2. Install frontend dependencies:
```bash
cd NAWA_CLIENT/front_end
npm install
```

3. Install backend dependencies:
```bash
cd ../back_end
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd NAWA_CLIENT/back_end
npm run dev
```
The backend server will run on http://localhost:8000

2. Start the frontend development server:
```bash
cd NAWA_CLIENT/front_end
npm run dev
```
The frontend application will be available at http://localhost:5173

## Features

- User Authentication (Admin, Teacher, Student)
- Calendar Management
- Leave Management
- Announcement System
- Responsive Design

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=8000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 