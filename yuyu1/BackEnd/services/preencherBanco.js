// services/preencherBanco.js
const axios = require('axios');
const { sequelize, Card, CardSet, CardImage, CardPrice } = require('../models/association');

class PreencherBanco {
  constructor() {
    this.baseUrl = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';
    this.batchSize = 50; // Reduzi para evitar timeouts
  }

  async syncDatabase() {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexão com banco estabelecida');
      
      // Sincronizar forçando a recriação se necessário
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Banco sincronizado');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao sincronizar banco:', error);
      return false;
    }
  }

  // Função auxiliar para delay
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Parse seguro de preços
  parsePrice(priceString) {
    if (!priceString || priceString === '0.00' || priceString === '' || priceString === 'N/A') return 0.0;
    const price = parseFloat(priceString);
    return isNaN(price) ? 0.0 : price;
  }

  async populateDatabase() {
    try {
      console.log('🚀 Iniciando população do banco de dados...');
      
      // Sincronizar primeiro
      const synced = await this.syncDatabase();
      if(!synced) {
        throw new Error('Falha na sincronização do banco');
      }

      console.log('📥 Buscando todos os cards de uma vez...');
      
      const response = await axios.get(this.baseUrl);
      const cardsData = response.data.data;
      
      if (!cardsData || cardsData.length === 0) {
        console.log('❌ Nenhum card encontrado na API');
        return { success: false, totalProcessed: 0 };
      }

      console.log(`📥 Encontrados ${cardsData.length} cards no total`);
      
      let totalProcessed = 0;
      let successCount = 0;
      let errorCount = 0;

      // Processar em lotes menores para evitar sobrecarga
      for (let i = 0; i < cardsData.length; i += this.batchSize) {
        const batch = cardsData.slice(i, i + this.batchSize);
        console.log(`🔄 Processando lote ${i / this.batchSize + 1} de ${Math.ceil(cardsData.length / this.batchSize)}...`);

        for (const cardData of batch) {
          try {
            await this.processCardData(cardData);
            successCount++;
            totalProcessed++;
          } catch (cardError) {
            errorCount++;
            console.error(`❌ Erro ao processar card ${cardData.id || 'N/A'}:`, cardError.message);
          }
        }

        console.log(`✅ Lote processado. Sucessos: ${successCount}, Erros: ${errorCount}`);
        
        // Pausa entre lotes
        if (i + this.batchSize < cardsData.length) {
          await this.sleep(1000);
        }
      }

      console.log(`🎉 População concluída!`);
      console.log(`📊 Total processados: ${totalProcessed}`);
      console.log(`✅ Sucessos: ${successCount}`);
      console.log(`❌ Erros: ${errorCount}`);
      
      return { success: true, totalProcessed, successCount, errorCount };
      
    } catch (error) {
      console.error('💥 Erro fatal na população do banco:', error);
      throw error;
    }
  }

  async processCardData(cardData) {
    return await sequelize.transaction(async (transaction) => {
      // Verificar se card já existe
      const existingCard = await Card.findByPk(cardData.id, { transaction });
      
      if (existingCard) {
        await this.updateCard(existingCard, cardData, transaction);
      } else {
        await this.createCard(cardData, transaction);
      }
    });
  }

  async createCard(cardData, transaction) {
    // DEBUG: Verificar estrutura dos dados
    console.log(`🔍 Processando card ${cardData.id}: ${cardData.name}`);
    console.log(`   - Card sets: ${cardData.card_sets ? cardData.card_sets.length : 0}`);
    console.log(`   - Card images: ${cardData.card_images ? cardData.card_images.length : 0}`);
    console.log(`   - Card prices: ${cardData.card_prices ? cardData.card_prices.length : 0}`);

    // Criar card principal
    const card = await Card.create({
      id: cardData.id,
      name: cardData.name,
      type: cardData.type,
      frameType: cardData.frameType,
      desc: cardData.desc,
      atk: cardData.atk || null,
      def: cardData.def || null,
      level: cardData.level || null,
      rank: cardData.rank || null,
      scale: cardData.scale || null,
      linkval: cardData.linkval || null,
      race: cardData.race,
      attribute: cardData.attribute || null,
      archetype: cardData.archetype || null
    }, { transaction });

    // Criar card sets - CORRIGIDO
    if (cardData.card_sets && cardData.card_sets.length > 0) {
      for (const set of cardData.card_sets) {
        try {
          await CardSet.create({
            card_id: card.id,
            set_name: set.set_name || 'Unknown Set',
            set_code: set.set_code || 'UNK-000',
            set_rarity: set.set_rarity || 'Common',
            set_rarity_code: set.set_rarity_code || '',
            set_price: this.parsePrice(set.set_price)
          }, { transaction });
        } catch (setError) {
          console.error(`   ❌ Erro ao criar set para card ${card.id}:`, setError.message);
        }
      }
      console.log(`   ✅ ${cardData.card_sets.length} card sets criados`);
    }

    // Criar card images - CORRIGIDO
    if (cardData.card_images && cardData.card_images.length > 0) {
      for (const image of cardData.card_images) {
        try {
          await CardImage.create({
            card_id: card.id,
            image_url: image.image_url || '',
            image_url_small: image.image_url_small || '',
            image_url_cropped: image.image_url_cropped || null
          }, { transaction });
        } catch (imageError) {
          console.error(`   ❌ Erro ao criar imagem para card ${card.id}:`, imageError.message);
        }
      }
      console.log(`   ✅ ${cardData.card_images.length} card images criados`);
    }

    // Criar card prices - CORRIGIDO
    if (cardData.card_prices && cardData.card_prices.length > 0) {
      const priceData = cardData.card_prices[0];
      try {
        await CardPrice.create({
          card_id: card.id,
          cardmarket_price: this.parsePrice(priceData.cardmarket_price),
          tcgplayer_price: this.parsePrice(priceData.tcgplayer_price),
          ebay_price: this.parsePrice(priceData.ebay_price),
          amazon_price: this.parsePrice(priceData.amazon_price),
          coolstuffinc_price: this.parsePrice(priceData.coolstuffinc_price)
        }, { transaction });
        console.log(`   ✅ Card price criado`);
      } catch (priceError) {
        console.error(`   ❌ Erro ao criar price para card ${card.id}:`, priceError.message);
      }
    }

    console.log(`✅ Card criado: ${card.id} - ${card.name}`);
  }

  async updateCard(existingCard, cardData, transaction) {
    console.log(`🔄 Atualizando card existente: ${existingCard.id} - ${existingCard.name}`);

    // Atualizar card principal
    await existingCard.update({
      name: cardData.name,
      type: cardData.type,
      frameType: cardData.frameType,
      desc: cardData.desc,
      atk: cardData.atk || null,
      def: cardData.def || null,
      level: cardData.level || null,
      rank: cardData.rank || null,
      scale: cardData.scale || null,
      linkval: cardData.linkval || null,
      race: cardData.race,
      attribute: cardData.attribute || null,
      archetype: cardData.archetype || null
    }, { transaction });

    // Remover dados antigos
    await CardSet.destroy({ where: { card_id: existingCard.id }, transaction });
    await CardImage.destroy({ where: { card_id: existingCard.id }, transaction });
    await CardPrice.destroy({ where: { card_id: existingCard.id }, transaction });

    // Recriar dados relacionados (usando a mesma lógica do create)
    if (cardData.card_sets && cardData.card_sets.length > 0) {
      for (const set of cardData.card_sets) {
        await CardSet.create({
          card_id: existingCard.id,
          set_name: set.set_name || 'Unknown Set',
          set_code: set.set_code || 'UNK-000',
          set_rarity: set.set_rarity || 'Common',
          set_rarity_code: set.set_rarity_code || '',
          set_price: this.parsePrice(set.set_price)
        }, { transaction });
      }
    }

    if (cardData.card_images && cardData.card_images.length > 0) {
      for (const image of cardData.card_images) {
        await CardImage.create({
          card_id: existingCard.id,
          image_url: image.image_url || '',
          image_url_small: image.image_url_small || '',
          image_url_cropped: image.image_url_cropped || null
        }, { transaction });
      }
    }

    if (cardData.card_prices && cardData.card_prices.length > 0) {
      const priceData = cardData.card_prices[0];
      await CardPrice.create({
        card_id: existingCard.id,
        cardmarket_price: this.parsePrice(priceData.cardmarket_price),
        tcgplayer_price: this.parsePrice(priceData.tcgplayer_price),
        ebay_price: this.parsePrice(priceData.ebay_price),
        amazon_price: this.parsePrice(priceData.amazon_price),
        coolstuffinc_price: this.parsePrice(priceData.coolstuffinc_price)
      }, { transaction });
    }

    console.log(`✅ Card atualizado: ${existingCard.id} - ${existingCard.name}`);
  }

  // Método para verificar o que foi inserido
  async checkDatabase() {
    try {
      const cardCount = await Card.count();
      const setCount = await CardSet.count();
      const imageCount = await CardImage.count();
      const priceCount = await CardPrice.count();

      console.log('\n📊 ESTATÍSTICAS DO BANCO:');
      console.log(`   Cards: ${cardCount}`);
      console.log(`   Card Sets: ${setCount}`);
      console.log(`   Card Images: ${imageCount}`);
      console.log(`   Card Prices: ${priceCount}`);

      // Mostrar alguns exemplos
      if (cardCount > 0) {
        const sampleCard = await Card.findOne({
          include: [
            { model: CardSet, as: 'card_sets' },
            { model: CardImage, as: 'card_images' },
            { model: CardPrice, as: 'card_prices' }
          ]
        });

        if (sampleCard) {
          console.log('\n🔍 CARD EXEMPLO:');
          console.log(`   ID: ${sampleCard.id}`);
          console.log(`   Nome: ${sampleCard.name}`);
          console.log(`   Sets: ${sampleCard.card_sets ? sampleCard.card_sets.length : 0}`);
          console.log(`   Images: ${sampleCard.card_images ? sampleCard.card_images.length : 0}`);
          console.log(`   Prices: ${sampleCard.card_prices ? 'Sim' : 'Não'}`);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao verificar banco:', error);
    }
  }
}

module.exports = new PreencherBanco();