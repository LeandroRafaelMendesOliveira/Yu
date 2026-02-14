const { get } = require('../routes/cards');
const cardService = require('../services/cardService');


// Exemplo de rota para buscar cards por nome
async function getCardsByName(req, res) {
    
    const { name } = req.params;

    console.log(name);
    try {
        const cards = await cardService.getCardsByName(name);
        res.json(cards);
       
        return cards;
    } catch (error) {
        console.error('Erro ao buscar cards por nome:', error);
        res.status(500).json({ error: 'Erro ao buscar cards por nome' });
    }
}

async function getSearchComplete(req, res) {
    try {
        const cards = await cardService.getSearchComplete();
        res.json(cards);
        return cards;
    } catch (error) {
        console.error('Erro ao buscar cards:', error);
        res.status(500).json({ error: 'Erro ao buscar cards' });
    }
}
  


module.exports = {
    getCardsByName,
    getSearchComplete
};


