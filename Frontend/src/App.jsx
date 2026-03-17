import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Classroom from './pages/Classroom';
import Landing from './pages/landing';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
  return (
    <div className='min-h-screen'>
      <Router>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/teacher' element={<TeacherDashboard />} />
          <Route path='/student' element={<StudentDashboard />} />
          <Route path='/classroom/:id' element={<Classroom />} />
          <Route path='/classroom' element={<Classroom />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;