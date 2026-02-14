// routes/populateRoutes.js
const express = require('express');
const router = express.Router();
const populateController = require('../controller/populateController');

// Popular banco completo
router.post('/populate', populateController.populateAll);

// Popular card específico por ID
router.post('/populate/card/:cardId', populateController.populateCardById);

// Popular por conjunto
router.post('/populate/set/:setName', populateController.populateBySet);

// Verificar status
router.get('/status', populateController.getStatus);

// Health check
router.get('/health', populateController.healthCheck);

// ⚠️ Rota perigosa - limpar banco
router.delete('/clear', populateController.clearDatabase);

module.exports = router;