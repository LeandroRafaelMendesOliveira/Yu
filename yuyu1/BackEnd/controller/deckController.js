const { response } = require('express');
const deckService = require('../services/deckService');
const sessaoService = require('../services/sessaoService');

const deckController = {
  async createDeck(req, res) {
    try {
      const deckCard = req.body.deck_cards[0];
      console.log("deckCard chegou:",deckCard);

      const auxToken = req.headers['authorization'];
      console.log("auxToken:",auxToken);
      const token = auxToken.split(' ')[1];


      console.log("token:",token.trim());
      
      const sessao =  await sessaoService.obterSessaoPorToken(token.trim());
      if (!sessao) {
        return res.status(401).json({
          success: false,
          message: 'Token de acesso inválido'
        });
      }

      const newDeck = await deckService.createDeck(req.body, sessao.userId); 
      


      
      for(let i=0;i<deckCard.length;i++){

        await deckService.saveDeckCard(deckCard[i],deckCard[i].quantity,deckCard[i].deckType,newDeck.id);
        console.log(deckCard[i]);
      }

      
      res.status(201).json({
        success: true,
        message: 'Deck criado com sucesso',
        data: { deck: newDeck }
      });


    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

 async getUserDecks(req, res) {
  try {
    console.log("=== INÍCIO getUserDecks ===");
    console.log("Headers authorization:", req.headers['authorization']);
    
    // Verificar se o header authorization existe
    if (!req.headers['authorization']) {
      console.log("ERRO: Token não fornecido");
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }

    const token = req.headers['authorization'];
    console.log("Token completo:", token);

    // Verificar se o token está no formato correto
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      console.log("ERRO: Formato de token inválido");
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    const tokenValue = tokenParts[1].trim();
    console.log("Token limpo:", tokenValue);
    
    // Obter sessão
    console.log("Buscando sessão...");
    const sessao = await sessaoService.obterSessaoPorToken(tokenValue);
    
    if (!sessao) {
      console.log("ERRO: Sessão não encontrada");
      return res.status(401).json({
        success: false,
        message: 'Token de acesso inválido ou expirado'
      });
    }

    const userid = sessao.userId;
    console.log("User ID encontrado:", userid);

    // Validar userid
    if (!userid) {
      console.log("ERRO: userId não encontrado na sessão");
      return res.status(401).json({
        success: false,
        message: 'ID do usuário não encontrado na sessão'
      });
    }

    console.log("Buscando decks para o usuário...");
    
    // Buscar decks do usuário
    const result = await deckService.getUserDecks(userid);
    
    console.log("Resultado encontrado:", {
      totalDecks: result ? result.length : 0,
      sample: result && result.length > 0 ? result[0] : null
    });
    
    // Verificar resultado
    if (!result || result.length === 0) {
      console.log("INFO: Nenhum deck encontrado");
      return res.status(200).json({
        success: true,
        message: 'Nenhum deck encontrado para o usuário',
        data: [],
        count: 0
      });
    }
    
    console.log(`SUCESSO: ${result.length} decks encontrados`);
    
    return res.status(200).json({
      success: true,
      message: 'Decks recuperados com sucesso',
      data: result,
      count: result.length
    });

  } catch (error) {
    console.error("=== ERRO EM getUserDecks ===");
    console.error("Mensagem:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("Tipo de erro:", error.name);
    
    // Tratamento específico para erro de coluna desconhecida
    if (error.message.includes('Unknown column') || error.message.includes('deck_type')) {
      console.error("SOLUÇÃO NECESSÁRIA: Adicionar coluna deck_type à tabela deck_cards");
      
      return res.status(500).json({
        success: false,
        message: 'Erro de configuração do banco de dados',
        error: 'A coluna deck_type não existe na tabela deck_cards',
        suggestion: 'Execute: ALTER TABLE deck_cards ADD COLUMN deck_type VARCHAR(50) DEFAULT "main"'
      });
    }
    
    // Tratamento específico para erros de banco de dados
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Erro de banco de dados',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor'
      });
    }
    
    // Tratamento geral
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar decks do usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},

  async getDeck(req, res) {
    try {
      const deck = await deckService.getDeckById(req.params.id, req.userId);
      
      res.json({
        success: true,
        data: { deck }
      });

    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async addCardToDeck(req, res) {
    try {
      const deckCard = await deckService.addCardToDeck(
        req.params.deckId, 
        req.body, 
        req.userId
      );
      
      res.status(201).json({
        success: true,
        message: 'Carta adicionada ao deck com sucesso',
        data: { deckCard }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async removeCardFromDeck(req, res) {
    try {
      const result = await deckService.removeCardFromDeck(
        req.params.deckId, 
        req.params.cardId, 
        req.userId
      );
      
      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateDeck(req, res) {
    try {
      const deck = await deckService.updateDeck(
        req.params.id, 
        req.body, 
        req.userId
      );
      
      res.json({
        success: true,
        message: 'Deck atualizado com sucesso',
        data: { deck }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async deleteDeck(req, res) {
    try {
      const token = req.headers['authorization'].split(' ')[1];
      const sessao =  await sessaoService.obterSessaoPorToken(token.trim());
      const result = await deckService.deleteDeck(req.params.id, sessao.userId);
      
      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getPublicDecks(req, res) {
    try {
      const result = await deckService.getPublicDecks(req.query);
      
      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async duplicateDeck(req, res) {
    try {
      const deck = await deckService.duplicateDeck(
        req.params.id, 
        req.userId, 
        req.body.newName
      );
      
      res.status(201).json({
        success: true,
        message: 'Deck duplicado com sucesso',
        data: { deck }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};


module.exports = deckController;