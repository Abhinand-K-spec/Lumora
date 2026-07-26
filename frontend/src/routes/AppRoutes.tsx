
import { Routes, Route} from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Home from '../pages/home/Home';
import ProtectedRoute from './ProtectedRoute';
import VerifyEmailPage from '../pages/auth/VerifyEmail';
import ResetPasswordPage from '../pages/auth/ResetPassword';


const AppRoutes = () => {
  return (
    <div>
        <Routes>
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>
            <Route path='/verifyEmail' element={<VerifyEmailPage/>}/>
            <Route path='/resetPassword' element={<ResetPasswordPage/>}/>

            <Route element={<ProtectedRoute/>}>
                <Route path='/' element={<Home/>}/>
            </Route>
            
        </Routes>
    </div>
  )
}

export default AppRoutes
