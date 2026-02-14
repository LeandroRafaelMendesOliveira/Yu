const { Op, Sequelize } = require('sequelize');
const { Card, CardSet, CardImage, CardPrice, Deck, DeckCard } = require('../models/association');

class CardService {
  async searchCards(filters = {}) {
    try {
      const { 
        name, 
        type, 
        race, 
        attribute, 
        archetype,
        atk_min, 
        atk_max,
        level,
        page = 1, 
        limit = 20 
      } = filters;

      const offset = (page - 1) * limit;
      const where = {};

      if (name) where.name = { [Op.like]: `%${name}%` };
      if (type) where.type = type;
      if (race) where.race = race;
      if (attribute) where.attribute = attribute;
      if (archetype) where.archetype = archetype;
      if (level) where.level = level;
      
      if (atk_min !== undefined || atk_max !== undefined) {
        where.atk = {};
        if (atk_min !== undefined) where.atk[Op.gte] = atk_min;
        if (atk_max !== undefined) where.atk[Op.lte] = atk_max;
      }

      const { count, rows: cards } = await Card.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']],
        include: [
          {
            model: CardSet,
            as: 'card_sets',
            attributes: ['set_name', 'set_code', 'set_rarity']
          },
          {
            model: CardImage,
            as: 'card_images',
            attributes: ['image_url', 'image_url_small'],
            limit: 1
          }
        ]
      });

      return {
        cards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      };

    } catch (error) {
      throw new Error(`Erro ao buscar cartas: ${error.message}`);
    }
  }

  async saveDeck(deckData, userId) {
    try {
      const { name, description, cards } = deckData;
      
      // Criar o deck
      const deck = await Deck.create({
        user_id: userId,
        name,
        description: description || '',
        created_at: new Date(),
        featured_card_id: null
      });

      // Adicionar cartas ao deck
      if (cards && cards.length > 0) {
        const deckCardsData = cards.map(card => ({
          deck_id: deck.id,
          card_id: card.id,
          deck_type: card.deck_type || 'main',
          quantity: card.quantity || 1,
          created_at: new Date(),
          

        }));
        console.log("deckserviceconso",deckCardsData);

        await DeckCard.bulkCreate(deckCardsData);
      }

      return deck;

    } catch (error) {
      throw new Error(`Erro ao salvar deck: ${error.message}`);
    }
  }

  async updateDeck(deckId, deckData, userId) {
    try {
      const { name, description, mainDeck, extraDeck, sideDeck } = deckData;
      
      // Verificar se o deck pertence ao usuário
      const deck = await Deck.findOne({ where: { id: deckId, user_id: userId } });
      if (!deck) {
        throw new Error('Deck não encontrado ou você não tem permissão para editá-lo');
      }

      // Atualizar informações básicas do deck
      await Deck.update(
        {
          name,
          description: description || '',
          updated_at: new Date()
        },
        { where: { id: deckId } }
      );

      // Remover cartas antigas
      await DeckCard.destroy({ where: { deck_id: deckId } });

      // Adicionar novas cartas
      const addCardsToDeck = async (cards, deckType) => {
        if (!cards || cards.length === 0) return;
        
        const deckCardsData = cards.map(card => ({
          deck_id: deckId,
          card_id: card.id,
          deck_type: deckType,
          quantity: card.quantity || 1,
          created_at: new Date()
        }));

        await DeckCard.bulkCreate(deckCardsData);
      };

      await addCardsToDeck(mainDeck, 'main');
      await addCardsToDeck(extraDeck, 'extra');
      await addCardsToDeck(sideDeck, 'side');

      return await this.getDeckById(deckId, userId);

    } catch (error) {
      throw new Error(`Erro ao atualizar deck: ${error.message}`);
    }
  }

  async getDeckById(deckId, userId = null) {
    try {
      const where = { id: deckId };
      if (userId) where.user_id = userId;

      const deck = await Deck.findOne({
        where,
        include: [
          {
            model: DeckCard,
            as: 'deck_cards',
            include: [
              {
                model: Card,
                as: 'card',
                include: [
                  {
                    model: CardImage,
                    as: 'card_images',
                    attributes: ['image_url', 'image_url_small'],
                    limit: 1
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!deck) {
        throw new Error('Deck não encontrado');
      }

      // Organizar cartas por tipo de deck
      const organizedDeck = {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        user_id: deck.user_id,
        created_at: deck.created_at,
        updated_at: deck.updated_at,
        main: [],
        extra: [],
        side: []
      };

      deck.deck_cards.forEach(deckCard => {
        const cardData = {
          ...deckCard.card.toJSON(),
          quantity: deckCard.quantity,
          deck_type: deckCard.deck_type
        };

        switch (deckCard.deck_type) {
          case 'main':
            organizedDeck.main.push(cardData);
            break;
          case 'extra':
            organizedDeck.extra.push(cardData);
            break;
          case 'side':
            organizedDeck.side.push(cardData);
            break;
        }
      });

      return organizedDeck;

    } catch (error) {
      throw new Error(`Erro ao obter deck: ${error.message}`);
    }
  }

  async getUserDecks(userId) {
  try {
    console.log("Buscando decks para userId:", userId);
    
    // PRIMEIRA OPÇÃO: Buscar apenas colunas que existem (versão mais segura)
    const decks = await Deck.findAll({
      where: { user_id: userId },
      attributes: ['id', 'name', 'description'], // Apenas colunas básicas que existem
      raw: true // Retorna objetos simples em vez de instâncias do modelo
    });

    console.log(`Encontrados ${decks.length} decks básicos`);
    
    // DEBUG: Mostrar o que foi encontrado
    console.log("Decks encontrados (primeiros 3):", decks.slice(0, 3));

    // Processar os decks
    const processedDecks = await Promise.all(
      decks.map(async (deck) => {
        try {
          // Contar cartas por tipo (com tratamento de erro)
          let mainCount = 0, extraCount = 0, sideCount = 0;
          
          try {
            // Tentar contar por deck_type
            mainCount = await DeckCard.count({
              where: { 
                deck_id: deck.id,
                deck_type: 'main'
              }
            });

            extraCount = await DeckCard.count({
              where: { 
                deck_id: deck.id,
                deck_type: 'extra'
              }
            });

            sideCount = await DeckCard.count({
              where: { 
                deck_id: deck.id,
                deck_type: 'side'
              }
            });
          } catch (countError) {
            console.log(`Aviso: Erro ao contar por tipo no deck ${deck.id}:`, countError.message);
            // Se der erro, contar todas como main
            const totalCount = await DeckCard.count({
              where: { deck_id: deck.id }
            });
            mainCount = totalCount;
          }

          // Buscar algumas cartas para preview
          let previewCards = [];
          try {
            const previewDeckCards = await DeckCard.findAll({
              where: { deck_id: deck.id },
              limit: 5,
              include: [
                {
                  model: Card,
                  as: 'card',
                  attributes: ['id', 'name', 'type'],
                  include: [
                    {
                      model: CardImage,
                      as: 'card_images',
                      attributes: ['image_url_small'],
                      limit: 1
                    }
                  ]
                }
              ]
            });

            previewCards = previewDeckCards.map(dc => {
              const dcData = dc.toJSON ? dc.toJSON() : dc;
              return {
                id: dcData.card?.id,
                name: dcData.card?.name || 'Carta desconhecida',
                type: dcData.card?.type || 'monster',
                deck_type: dcData.deck_type || 'main',
                image: dcData.card?.card_images?.[0]?.image_url_small || null
              };
            });
          } catch (previewError) {
            console.log(`Aviso: Erro ao buscar preview do deck ${deck.id}:`, previewError.message);
          }

          // Retornar deck processado
          return {
            id: deck.id,
            name: deck.name,
            description: deck.description || '',
            card_count: mainCount + extraCount + sideCount,
            main_count: mainCount,
            extra_count: extraCount,
            side_count: sideCount,
            preview_cards: previewCards,
            updated_at: new Date().toISOString(), // Data atual como fallback
            created_at: new Date().toISOString()  // Data atual como fallback
          };

        } catch (deckError) {
          console.error(`Erro crítico ao processar deck ${deck.id}:`, deckError);
          
          // Retornar deck mínimo em caso de erro
          return {
            id: deck.id,
            name: deck.name,
            description: deck.description || '',
            card_count: 0,
            main_count: 0,
            extra_count: 0,
            side_count: 0,
            preview_cards: [],
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            error: 'Erro ao carregar detalhes do deck'
          };
        }
      })
    );

    console.log(`Processamento concluído: ${processedDecks.length} decks`);
    return processedDecks;

  } catch (error) {
    console.error("Erro crítico em getUserDecks:", error);
    
    // Log mais detalhado para debug
    if (error.sql) {
      console.error("SQL que causou o erro:", error.sql);
    }
    
    // Verificar se é erro de coluna
    if (error.message.includes('Unknown column')) {
      const match = error.message.match(/Unknown column '([^']+)'/);
      if (match) {
        console.error(`PROBLEMA: Coluna '${match[1]}' não existe na tabela`);
        
        // Sugestões baseadas na coluna faltante
        if (match[1].includes('created_at') || match[1].includes('updated_at')) {
          console.error("SOLUÇÃO RÁPIDA: Execute no MySQL:");
          console.error(`
            ALTER TABLE decks 
            ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
          `);
        }
      }
    }
    
    throw new Error(`Erro ao obter decks do usuário: ${error.message}`);
  }
}

  async deleteDeck(deckId, userId) {
  
    try {
      console.log(deckId, userId);
      // Verificar se o deck pertence ao usuário
      console.log("=== INÍCIO deleteDeck ===");
      const deck = await Deck.findOne({ where: { id: deckId, user_id: userId } });
      if (!deck) {
        throw new Error('Deck não encontrado ou você não tem permissão para deletá-lo');
      }

      // Deletar primeiro as cartas do deck
      await DeckCard.destroy({ where: { deck_id: deckId } });
      
      // Depois deletar o deck
      const deleted = await Deck.destroy({ where: { id: deckId } });
      
      if (!deleted) {
        throw new Error('Erro ao deletar deck');
      }

      return { message: 'Deck deletado com sucesso' };

    } catch (error) {
      throw new Error(`Erro ao deletar deck: ${error.message}`);
    }
  }

  async getCardById(cardId) {
    try {
      const card = await Card.findByPk(cardId, {
        include: [
          {
            model: CardSet,
            as: 'card_sets',
            attributes: ['set_name', 'set_code', 'set_rarity', 'set_price']
          },
          {
            model: CardImage,
            as: 'card_images',
            attributes: ['image_url', 'image_url_small', 'image_url_cropped']
          },
          {
            model: CardPrice,
            as: 'card_prices',
            attributes: ['cardmarket_price', 'tcgplayer_price', 'ebay_price']
          }
        ]
      });

      if (!card) {
        throw new Error('Carta não encontrada');
      }

      return card;

    } catch (error) {
      throw new Error(`Erro ao obter carta: ${error.message}`);
    }
  }

  async getRandomCards(limit = 10) {
    try {
      const cards = await Card.findAll({
        order: Sequelize.literal('RAND()'),
        limit: parseInt(limit),
        include: [{
          model: CardImage,
          as: 'card_images',
          attributes: ['image_url', 'image_url_small'],
          limit: 1
        }]
      });

      return cards;

    } catch (error) {
      throw new Error(`Erro ao obter cartas aleatórias: ${error.message}`);
    }
  }

  async getCardsBySet(setCode) {
    try {
      const cards = await Card.findAll({
        include: [
          {
            model: CardSet,
            as: 'card_sets',
            where: { set_code: { [Op.like]: `%${setCode}%` } },
            attributes: []
          },
          {
            model: CardImage,
            as: 'card_images',
            attributes: ['image_url', 'image_url_small'],
            limit: 1
          }
        ]
      });

      return cards;

    } catch (error) {
      throw new Error(`Erro ao obter cartas do conjunto: ${error.message}`);
    }
  }

  async validateDeck(deckData) {
    const { mainDeck = [], extraDeck = [], sideDeck = [] } = deckData;
    
    const errors = [];

    // Validar tamanho do deck principal
    const mainCount = mainDeck.reduce((sum, card) => sum + (card.quantity || 1), 0);
    if (mainCount < 40) {
      errors.push('Deck principal deve ter pelo menos 40 cartas');
    }
    if (mainCount > 60) {
      errors.push('Deck principal não pode ter mais de 60 cartas');
    }

    // Validar tamanho do deck extra
    const extraCount = extraDeck.reduce((sum, card) => sum + (card.quantity || 1), 0);
    if (extraCount > 15) {
      errors.push('Deck extra não pode ter mais de 15 cartas');
    }

    // Validar tamanho do deck side
    const sideCount = sideDeck.reduce((sum, card) => sum + (card.quantity || 1), 0);
    if (sideCount > 15) {
      errors.push('Deck side não pode ter mais de 15 cartas');
    }

    // Validar cartas proibidas/limitadas
    const cardCounts = {};
    const allCards = [...mainDeck, ...extraDeck, ...sideDeck];
    
    allCards.forEach(card => {
      cardCounts[card.id] = (cardCounts[card.id] || 0) + (card.quantity || 1);
    });

    // Validar limite de 3 cópias por carta
    for (const [cardId, count] of Object.entries(cardCounts)) {
      if (count > 3) {
        errors.push(`Carta com ID ${cardId} excede o limite de 3 cópias`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      counts: {
        main: mainCount,
        extra: extraCount,
        side: sideCount
      }
    };
  }

  async saveDeckCard(deckCardData, quantity, deckType, deckId) {
    try {
      const newDeckCard = await DeckCard.create({
        deck_id: deckId,
        card_id: deckCardData.card_id,
        quantity: quantity,
        deck_type: deckType,
        created_at: new Date()
      });
      return newDeckCard;
    } catch (error) {
      throw new Error(`Erro ao salvar carta no deck: ${error.message}`);
    }
  }

  async createDeck(deckData, userId) {
    try {
      const newDeck = await Deck.create({
        user_id: userId,
        name: deckData.name,
        created_at: new Date(),
        description: deckData.description || '',
      });
      return newDeck;
    } catch (error) {
      throw new Error(`Erro ao criar deck: ${error.message}`);
    }
  }
}

module.exports = new CardService();