
import { Routes, Route} from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Home from '../pages/home/Home';
import ProtectedRoute from './ProtectedRoute';


const AppRoutes = () => {
  return (
    <div>
        <Routes>
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>

            <Route element={<ProtectedRoute/>}>
                <Route path='/' element={<Home/>}/>
            </Route>
            
        </Routes>
    </div>
  )
}

export default AppRoutes
