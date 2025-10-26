import bcrypt from 'bcryptjs';
import { jwtDecode } from 'jwt-decode';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'GRILLA_OFFLINE_SECRET_KEY';

export const useAuthService = () => {
  const { addRecord, getAllRecords, getRecordsByIndex } = useDB();

  const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
  };

  const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  };

  const generateToken = (user) => {
    return jwt.sign(
      {
        user_id: user._id,
        username: user.username,
        name: user.name,
        rol: user.rol,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  };

  const registerUser = async (userData) => {
    try {
      // Check if user already exists
      const existingUsers = await getRecordsByIndex('users', 'username', userData.username);
      if (existingUsers.length > 0) {
        throw new Error('El Usuario ya existe!');
      }

      const hashedPassword = await hashPassword(userData.password);
      const newUser = {
        ...userData,
        password: hashedPassword,
      };

      const savedUser = await addRecord('users', newUser);
      const token = generateToken(savedUser);
      
      return {
        ...savedUser,
        token,
      };
    } catch (error) {
      throw error;
    }
  };

  const loginUser = async (loginData) => {
    try {
      const users = await getRecordsByIndex('users', 'username', loginData.username);
      
      if (users.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const user = users[0];
      const isValidPassword = await comparePassword(loginData.password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Contraseña incorrecta');
      }

      const token = generateToken(user);
      
      return {
        ...user,
        token,
      };
    } catch (error) {
      throw error;
    }
  };

  const getUsersCount = async () => {
    try {
      return await countRecords('users');
    } catch (error) {
      throw error;
    }
  };

  const verifyToken = (token) => {
    const decoded = jwtDecode(token);
    const signature = btoa('offline-signature');
    return { decoded, signature };
  };

  return {
    registerUser,
    loginUser,
    getUsersCount,
    verifyToken,
  };
};