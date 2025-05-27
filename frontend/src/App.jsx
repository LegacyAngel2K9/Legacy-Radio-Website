import { Routes, Route, Link } from 'react-router-dom'
import Login from './Auth/Login';
import Register from './Auth/Register';
import VerifyEmail from './Auth/VerifyEmail';

import { useAuthContext } from './hooks/useAuthContext'

function App() {

  const { user } = useAuthContext();

  return (
    <>
      <Routes>
				<Route exact path="/"  element={<Login />} />
				<Route exact path="/login" element={<Login />} />
				<Route exact path="/register" element={<Register />} />
        <Route exact path="/verify-email" element={<VerifyEmail />} />
				{/* <Route path="/dashboard" exact element={Dashboard} /> */}
			</Routes>
    </>
  )
}

export default App
