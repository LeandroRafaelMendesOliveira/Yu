// controllers/populateController.js
const yugiohApiService = require('../services/preencherBanco');
const { Card, CardSet } = require('../models/association');

const populateController = {
  // Popular banco completo
  async populateAll(req, res) {
    try {
      console.log('🎯 Iniciando população completa do banco via API...');
      
      // Executar em segundo plano e retornar resposta imediata
      yugiohApiService.populateDatabase()
        .then(result => {
          console.log('✅ População concluída com sucesso!');
          console.log('📊 Resultado:', result);
        })
        .catch(error => {
          console.error('❌ Erro na população:', error);
        });

      res.json({
        success: true,
        message: 'População do banco iniciada em segundo plano. Verifique os logs do servidor para acompanhar o progresso.',
        timestamp: new Date().toISOString(),
        processId: process.pid
      });

    } catch (error) {
      console.error('💥 Erro ao iniciar população:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao iniciar população do banco',
        error: error.message
      });
    }
  },

  // Popular card específico por ID
  async populateCardById(req, res) {
    try {
      const { cardId } = req.params;
      
      if (!cardId || isNaN(cardId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do card inválido'
        });
      }

      console.log(`🎯 Iniciando população do card ID: ${cardId}`);
      
      const result = await yugiohApiService.populateSingleCard(parseInt(cardId));
      
      if (result) {
        res.json({
          success: true,
          message: `Card ${cardId} populado com sucesso!`
        });
      } else {
        res.status(404).json({
          success: false,
          message: `Card ${cardId} não encontrado na API`
        });
      }

    } catch (error) {
      console.error(`💥 Erro ao popular card ${req.params.cardId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Erro ao popular card específico',
        error: error.message
      });
    }
  },

  // Popular por conjunto específico (ajustado)
  async populateBySet(req, res) {
    try {
      const { setName } = req.params;
      
      if (!setName) {
        return res.status(400).json({
          success: false,
          message: 'Nome do conjunto é obrigatório'
        });
      }

      console.log(`🎯 Iniciando população do conjunto: ${setName}`);
      
      // Como não temos populateSet no serviço, vamos buscar cards do conjunto
      const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${encodeURIComponent(setName)}`);
      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Conjunto "${setName}" não encontrado ou sem cards`
        });
      }

      // Processar cards do conjunto em segundo plano
      Promise.all(data.data.map(card => yugiohApiService.processCardData(card)))
        .then(() => {
          console.log(`✅ Conjunto "${setName}" populado com sucesso!`);
        })
        .catch(error => {
          console.error(`❌ Erro no conjunto "${setName}":`, error);
        });

      res.json({
        success: true,
        message: `População do conjunto "${setName}" iniciada em segundo plano. Encontrados ${data.data.length} cards.`,
        cardsFound: data.data.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`💥 Erro ao popular conjunto ${req.params.setName}:`, error);
      res.status(500).json({
        success: false,
        message: 'Erro ao iniciar população do conjunto',
        error: error.message
      });
    }
  },

  // Verificar status da população
  async getStatus(req, res) {
    try {
      const [cardCount, setCount] = await Promise.all([
        Card.count(),
        CardSet.count()
      ]);
      
      // Estatísticas adicionais
      const cardStats = await Card.findAll({
        attributes: [
          'type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['type'],
        raw: true
      });

      const recentCards = await Card.findAll({
        order: [['id', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'type']
      });

      res.json({
        success: true,
        data: {
          total_cards: cardCount,
          total_sets: setCount,
          database_size: `${cardCount} cards, ${setCount} sets`,
          statistics: {
            by_type: cardStats,
            recent_cards: recentCards
          },
          last_updated: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('💥 Erro ao obter status do banco:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter status do banco',
        error: error.message
      });
    }
  },

  // Limpar banco de dados (CUIDADO!)
  async clearDatabase(req, res) {
    try {
      const { confirmation } = req.body;
      
      if (confirmation !== 'CONFIRMAR_LIMPEZA') {
        return res.status(400).json({
          success: false,
          message: 'Confirmação necessária para limpar o banco. Envie confirmation: "CONFIRMAR_LIMPEZA" no body.'
        });
      }

      console.log('⚠️  Iniciando limpeza do banco de dados...');
      
      // Limpar em ordem para respeitar constraints
      await CardPrice.destroy({ where: {} });
      await CardImage.destroy({ where: {} });
      await CardSet.destroy({ where: {} });
      await Card.destroy({ where: {} });

      console.log('✅ Banco de dados limpo com sucesso!');

      res.json({
        success: true,
        message: 'Banco de dados limpo com sucesso!',
        tables_cleared: ['cards', 'card_sets', 'card_images', 'card_prices']
      });

    } catch (error) {
      console.error('💥 Erro ao limpar banco:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao limpar banco de dados',
        error: error.message
      });
    }
  },

  // Health check
  async healthCheck(req, res) {
    try {
      // Testar conexão com banco
      await sequelize.authenticate();
      
      const [cardCount, setCount] = await Promise.all([
        Card.count(),
        CardSet.count()
      ]);

      res.json({
        success: true,
        status: 'healthy',
        database: 'connected',
        statistics: {
          total_cards: cardCount,
          total_sets: setCount
        },
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });

    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = populateController;