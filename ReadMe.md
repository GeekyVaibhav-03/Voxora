# Voxora

Voxora is a comprehensive video conferencing platform designed for educational environments. It enables seamless real-time communication between teachers and students, featuring video meetings, interactive chat, polling, leaderboards, and analytics.

## Features

- **Real-time Video Conferencing**: High-quality video meetings with multiple participants
- **Interactive Chat**: Real-time messaging during sessions
- **Polling System**: Create and conduct polls during meetings
- **Leaderboard**: Track and display participant engagement
- **Analytics Dashboard**: Monitor meeting statistics and performance
- **User Authentication**: Separate login systems for students and teachers
- **Classroom Management**: Dedicated spaces for different classes and subjects

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Socket.io** for real-time communication
- **MongoDB** with Mongoose for data storage
- **bcrypt** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React** with Vite for fast development
- **Material-UI** for UI components
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.io Client** for real-time features
- **Axios** for API calls

## Project Structure

```
Voxora/
├── Backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   │   ├── socketManager.js
│   │   │   └── user.controller.js
│   │   ├── models/
│   │   │   ├── meeting.model.js
│   │   │   └── user.model.js
│   │   └── routes/
│   │       └── users.routes.js
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalyticsCard.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PollModal.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── VideoGrid.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Authentication.jsx
│   │   │   ├── Classroom.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── VideoMeet.jsx
│   │   │   └── ...
│   │   └── utils/
│   │       └── withAuth.jsx
│   ├── public/
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Ensure MongoDB is running on your system
2. Start the backend server (runs on port 3000 by default)
3. Start the frontend development server (runs on port 5173 by default)
4. Access the application at `http://localhost:5173`

## API Endpoints

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Meetings
- `POST /api/meetings/create` - Create a new meeting
- `GET /api/meetings/:id` - Get meeting details
- `POST /api/meetings/:id/join` - Join a meeting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Author

Vaibhav Bharade

## Acknowledgments

- Built with React, Node.js, and Socket.io
- UI components powered by Material-UI
- Styling with Tailwind CSS 