import {Router} from 'express';


import { AuthController } from '../controllers/AuthController.js';
import { AuthService } from '../services/AuthService.js';
import { PasswordService } from '../services/PasswordService.js';
import { TokenService } from '../services/TokenService.js';
import { UserRepository } from '../../../repositories/UserRepository.js';

const router = Router();

const userRepository = new UserRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();


const authService = new AuthService(
    userRepository, passwordService, tokenService
)

const authController = new AuthController(authService);



router.post('/register',authController.register.bind(authController))


export default router;