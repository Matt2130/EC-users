import User from "../models/usersModels.js";
import { userCreatedEvent, sendPasswordResetEvent } from "../services/rabbitServicesEvent.js";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';

dotenv.config();

// Create User con validación de rol
export const createUser = async (req, res) => {
    try {
        const { password, username, phone, role } = req.body;

        // Validación de campos obligatorios
        if (!phone || !username || !password) {
            return res.status(400).json({ message: 'Teléfono, usuario y contraseña son obligatorios' });
        }

        // Validación de formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
            return res.status(400).json({ message: 'Formato de correo inválido' });
        }

        // Validación de rol
        if (role && !['cliente', 'administrador'].includes(role)) {
            return res.status(400).json({ message: 'Rol inválido' });
        }

        // Validación de contraseña
        if (password.length < 8) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
        }

        // Validación de teléfono
        if (phone.length !== 10) {
            return res.status(400).json({ message: 'El teléfono debe tener exactamente 10 dígitos' });
        }

        // Verificar existencia de teléfono
        const existingPhone = await User.findOne({ where: { phone } });
        if (existingPhone) {
            return res.status(400).json({ message: 'El teléfono ya existe' });
        }

        // Verificar existencia de usuario
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear usuario con rol
        const newUser = await User.create({
            phone,
            username,
            password,
            role: role || 'cliente', // Usar valor por defecto si no se provee
            status: true,
            creationDate: new Date(),
        });

        await userCreatedEvent(newUser);
        return res.status(201).json({ 
            message: 'Usuario creado', 
            data: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                creationDate: newUser.creationDate
            }
        });

    } catch (error) {
        console.error('Error al crear usuario: ', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

//Get all my users with get
export const getUser = async(req, res) => {
    try {
        const users = await User.findAll();
        return res.status(200).json(users)
    } catch (error) {
        console.error('Error al listar usuarios: ', error);
        return res.status(500).json({ message: 'Error al obtener los usuarios'});
    }
};

//Update users 
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { password, phone, role } = req.body;

    try {
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (password && password.length < 8) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
        }

        if (phone) {
            if (phone.length !== 10) {
                return res.status(400).json({ message: 'El teléfono debe tener exactamente 10 dígitos' });
            }

            const existingPhone = await User.findOne({ where: { phone } });
            if (existingPhone && existingPhone.id !== user.id) {
                return res.status(400).json({ message: 'El teléfono ya está en uso por otro usuario' });
            }
        }

        if (role && !['cliente', 'administrador'].includes(role)) {
            return res.status(400).json({ message: 'Rol inválido. Debe ser "cliente" o "administrador"' });
        }

        await user.update({
            phone: phone || user.phone,
            password: password || user.password,
            role: role || user.role,
        });

        return res.status(200).json({ message: 'Usuario actualizado', data: user });

    } catch (error) {
        console.error('Error al actualizar los datos: ', error);
        return res.status(500).json({ message: 'Error al actualizar los datos' });
    }
};

//Delete users with patch
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si el usuario existe
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el usuario ya está desactivado
        if (!user.status) {
            return res.status(400).json({ message: "El usuario ya está desactivado." });
        }

        // Cambiar el estado del usuario en lugar de eliminarlo
        await user.update({ status: false });

        return res.status(200).json({ message: 'Usuario eliminado correctamente', data: user });
    } catch (error) {
        console.error('Error al eliminar usuario: ', error);
        return res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

//Loggeo users
export const login = async (req, res) => {
    try {
        // Obtener credenciales 
        const { username, password } = req.body;
        const SECRET_KEY = process.env.SECRET_KEY;

        // Buscar usuario en la base de datos
        const user = await User.findOne({ where: { username } }); 
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Usuario y/o contraseña incorrectos' });
        }

        // Generar token JWT 
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Usuario autenticado', token });
    } catch (error) {
        console.error('Error al autenticar usuario: ', error);
        return res.status(500).json({ message: 'Error al autenticar usuario' });
    }
};

export const passwordToken = async (req, res) => {
    const { username } = req.body;
    
    try {
        // Verificar si el usuario existe
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generar un token de recuperación con un tiempo de expiración de 1 hora
        const resetToken = jwt.sign(
            { id: user.id, userName: user.username },
            process.env.SECRET_KEY,
            { expiresIn: '10m' }
        );

        // Enviar el evento a RabbitMQ con el token generado
        await sendPasswordResetEvent(user, resetToken);

        return res.status(200).json({
            message: 'Token de recuperación generado exitosamente'
        });
    } catch (error) {
        console.error('Error al generar el token de recuperación:', error);
        return res.status(500).json({ message: 'Error al generar el token' });
    }
};

export const newPassword = async (req, res) => {
    const { token } = req.params;  // Token que se pasa en la URL
    const { password, repeatPassword } = req.body;

    try {
        // Verificar si las contraseñas coinciden
        if (password !== repeatPassword) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden' });
        }

        // Verificar el token de recuperación
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        // Buscar el usuario por el id contenido en el token
        const user = await User.findOne({ where: { id: decoded.id } });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar la contraseña del usuario
        user.password = password;
        await user.save();

        return res.status(200).json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }
        console.error('Error al actualizar la contraseña:', error);
        return res.status(500).json({ message: 'Error al actualizar la contraseña' });
    }
};