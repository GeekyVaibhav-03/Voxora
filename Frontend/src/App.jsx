import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Classroom from './pages/Classroom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentLogin from './pages/StudentLogin';
import TeacherLogin from './pages/TeacherLogin';

function RequireAuth({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to='/' replace />;
  }

  if (allowedRole && role !== allowedRole) {
    if (role === 'teacher') {
      return <Navigate to='/teacher' replace />;
    }

    if (role === 'student') {
      return <Navigate to='/student' replace />;
    }

    return <Navigate to='/' replace />;
  }

  return children;
}

function App() {
  return (
    <div className='min-h-screen'>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<Landing />} />
            <Route path='/auth' element={<Navigate to='/' replace />} />
            <Route path='/login/student' element={<StudentLogin />} />
            <Route path='/login/teacher' element={<TeacherLogin />} />
            <Route
              path='/teacher'
              element={(
                <RequireAuth allowedRole='teacher'>
                  <TeacherDashboard />
                </RequireAuth>
              )}
            />
            <Route
              path='/student'
              element={(
                <RequireAuth allowedRole='student'>
                  <StudentDashboard />
                </RequireAuth>
              )}
            />
            <Route
              path='/classroom/:id'
              element={(
                <RequireAuth>
                  <Classroom />
                </RequireAuth>
              )}
            />
            <Route
              path='/classroom'
              element={(
                <RequireAuth>
                  <Classroom />
                </RequireAuth>
              )}
            />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;