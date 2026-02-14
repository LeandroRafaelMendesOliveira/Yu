// Arquivo: cardService.js

const { Op, Sequelize } = require('sequelize'); 
const { Card, CardSet, CardImage } = require('../models/association');

// Função para buscar cards por nome
async function getCardsByName(name) {
   
    const searchName = name ? name.toLowerCase() : ''; 
    
    try {
        const cards = await Card.findAll({
            where: {
                [Op.and]: Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('name')), 
                    {
                        [Op.like]: `%${searchName}%` 
                    }
                )
            },
            include: [
                {
                    model: CardSet,
                    as: 'card_sets',
                    attributes: ['id', 'set_name', 'set_code', 'set_rarity', 'set_price']
                },
                {
                    model: CardImage,
                    as: 'card_images',
                    attributes: ['id', 'image_url', 'image_url_small'] 
                }
            ]
        });
        console.log(JSON.stringify(cards, null, 2));
        
        return cards;
    } catch (error) {
        console.error('Erro ao buscar cards por nome:', error);
        throw error;
    }
}

// Função para busca completa por: nome, atributo, tipo
async function getSearchComplete(searchParams) {
    try {
        const { name, attribute, type, race, archetype } = searchParams;
        
        // Construir condições WHERE dinamicamente
        const whereConditions = {};
        
        // Busca por nome (parcial, case insensitive)
        if (name && name.trim() !== '') {
            whereConditions.name = {
                [Op.iLike]: `%${name.trim()}%`
            };
        }
        
        // Busca por atributo (exata)
        if (attribute && attribute.trim() !== '') {
            whereConditions.attribute = {
                [Op.iLike]: attribute.trim()
            };
        }
        
        // Busca por tipo (parcial, case insensitive)
        if (type && type.trim() !== '') {
            whereConditions.type = {
                [Op.iLike]: `%${type.trim()}%`
            };
        }
        
        // Busca por raça (parcial, case insensitive)
        if (race && race.trim() !== '') {
            whereConditions.race = {
                [Op.iLike]: `%${race.trim()}%`
            };
        }
        
        // Busca por arquétipo (parcial, case insensitive)
        if (archetype && archetype.trim() !== '') {
            whereConditions.archetype = {
                [Op.iLike]: `%${archetype.trim()}%`
            };
        }

        const cards = await Card.findAll({
            where: whereConditions,
            include: [
                {
                    model: CardSet,
                    as: 'card_sets',
                    attributes: ['id', 'set_name', 'set_code', 'set_rarity', 'set_price']
                },
                {
                    model: CardImage,
                    as: 'card_images',
                    attributes: ['id', 'image_url', 'image_url_small'] 
                }
            ],
            order: [['name', 'ASC']] // Ordenar por nome
        });
        
        console.log(`Busca completa encontrou ${cards.length} cartas`);
        return cards;
        
    } catch (error) {
        console.error('Erro ao buscar cards (busca completa):', error);
        throw error;
    }
}

// Função alternativa com mais flexibilidade nos filtros
async function getAdvancedSearch(filters) {
    try {
        const { 
            name, 
            attribute, 
            type, 
            race, 
            archetype,
            level,
            atk,
            def,
            card_sets // para buscar por nome do set
        } = filters;
        
        const whereConditions = {};
        const includeConditions = [];
        
        // Filtros básicos
        if (name) whereConditions.name = { [Op.iLike]: `%${name}%` };
        if (attribute) whereConditions.attribute = { [Op.iLike]: attribute };
        if (type) whereConditions.type = { [Op.iLike]: `%${type}%` };
        if (race) whereConditions.race = { [Op.iLike]: `%${race}%` };
        if (archetype) whereConditions.archetype = { [Op.iLike]: `%${archetype}%` };
        
        // Filtros numéricos
        if (level) whereConditions.level = level;
        if (atk) whereConditions.atk = atk;
        if (def) whereConditions.def = def;
        
        // Incluir CardSets (sempre)
        includeConditions.push({
            model: CardSet,
            as: 'card_sets',
            attributes: ['id', 'set_name', 'set_code', 'set_rarity', 'set_price']
        });
        
        // Filtro por nome do set
        if (card_sets) {
            includeConditions[0].where = {
                set_name: { [Op.iLike]: `%${card_sets}%` }
            };
        }
        
        // Incluir CardImages (sempre)
        includeConditions.push({
            model: CardImage,
            as: 'card_images',
            attributes: ['id', 'image_url', 'image_url_small']
        });

        const cards = await Card.findAll({
            where: whereConditions,
            include: includeConditions,
            order: [['name', 'ASC']]
        });
        
        console.log(`Busca avançada encontrou ${cards.length} cartas`);
        return cards;
        
    } catch (error) {
        console.error('Erro na busca avançada:', error);
        throw error;
    }
}

module.exports = {
    getCardsByName,
    getSearchComplete,
    getAdvancedSearch
};