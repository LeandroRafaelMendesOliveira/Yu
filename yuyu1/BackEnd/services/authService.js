const User = require('../models/user');
require ('dotenv').config();

const jwt = require('jsonwebtoken');




async function registerUser(username, email, password, role) {
  try {
    console.log("entrou no service");
    console.log(username, email, password, role);
    const newUser = await User.create({ username, email, password, role});
    return newUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function loginUser(email, password) {

  
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Usuário não encontrado');
    } 
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function generateToken(user) {
  
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;

}


module.exports = {
  registerUser,
  loginUser,
  generateToken

};