import { alertContext } from './context/context'
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import NavbarComponent from './components/Navbar';
import { useState } from 'react';
import AlertComponent from './components/AlertComponent';
import CourseProgress from './components/CourseProgress/CourseProgress';
import Recommendations from './components/Recommendations/Recommendation';
import ProfileUpdateForm from './components/UserProfileForm/UserProfileForm';
import Register from './components/Register';
import Login from './components/Login';


function App() {
  const [alert, setAlert] = useState(null)

  const showAlert = (message, type) => {
    setAlert({
      message: message,
      type: type
    })
    setTimeout(() => {
      setAlert()
    }, 1500)
  }

  return (
      <alertContext.Provider value={{alert, showAlert}}>
    <Router>
    {localStorage.getItem('user') ? (
    <NavbarComponent user={localStorage.getItem('user')} />
    ): <></>
    }
    <AlertComponent alert={alert} />
    <Routes>
    <Route
        path="/"
        element={
        localStorage.getItem('user') ? (
        <Navigate to="/courses" />
        ) : (
        <Navigate to="/login" />
        )
        }
    />
      <Route path='courses/' element={<CourseProgress />}></Route>
      <Route path='recommendations/' element={<Recommendations />}></Route>
      <Route path='profile/' element={<ProfileUpdateForm />}></Route>
      <Route path='/login' element={<Login />}></Route>
      <Route path='/signup' element={< Register />}></Route>
    </Routes>
    </Router>
    </alertContext.Provider>
  );
}

export default App;
