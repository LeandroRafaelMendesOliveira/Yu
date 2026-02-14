
const bcrypt = require('bcryptjs');
const authService = require('../services/authService');
const Sessao  = require('../models/Sessao');
const deckController = require('./deckController');


async function register(req, res) {

  console.log("controller de registro chamado");

  const {username, email, password, role } = req.body;
  console.log(username);
  await authService.registerUser(username, email, password, role)
    .then(user => {
      res.status(201).json({ message: 'Usuário registrado com sucesso', user });
    })
    .catch(error => {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
    });
}

async function login(req, res) {
  const { email, password } = req.body;
  await authService.loginUser(email, password)
    .then(user => {
      bcrypt.compare(password, user.password, async (err, isMatch) => {
        if (err) {
          console.error('Erro ao comparar senhas:', err);
          return res.status(500).json({ message: 'Erro ao logar usuário', error: err.message });
        }
        if (isMatch) {

          await Sessao.destroy({ where: { userId: user.id } });
          
          const token = await authService.generateToken(user);
          
          // Criar uma nova sessão
          await Sessao.create({
            userId: user.id,
            token: token,
            loginTime: new Date()
          });


          res.status(200).json({ message: 'Usuário logado com sucesso', user, token });
        } else {
          res.status(401).json({ message: 'Senha incorreta' }); 
        }
    })
    })
    .catch(error => {
      console.error('Erro ao logar usuário:', error);
      res.status(500).json({ message: 'Erro ao logar usuário', error: error.message });
    });
}

module.exports = {
  register,
  login
};




 

