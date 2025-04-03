import express from 'express';
import { createUser, login, passwordToken, newPassword, getUser, updateUser, deleteUser } from '../controller/usersController.js';

const router = express.Router();

router.post('/create', createUser);

router.post('/login', login);

router.post('/token', passwordToken);

router.post('/newpassword/:token', newPassword)

router.get('/all', getUser);

router.put('/update/:id', updateUser);

router.patch('/remove/:id', deleteUser);

export default router;