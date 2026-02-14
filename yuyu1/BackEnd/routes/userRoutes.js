// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/auth');

// Rotas públicas
router.post('/register',(req, res)=>{
  function registrar(req, res){
    console.log("entrou na rota de registro");
    userController.register(req, res);
  }
    registrar(req, res);
});
 
router.post('/login', userController.login);



module.exports = router;