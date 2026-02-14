require ('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const deckRoutes = require('./routes/deckRoutes');
const userRoutes = require('./routes/userRoutes');
const card = require('./routes/cards');
const animationRotas = require('./routes/animationRoutes');
const sequelize = require('./db/database');
const populateRoutes = require('./routes/populateRoutes')
const { Card, CardSet, CardImage, CardPrice, User, Deck, DeckCard,Sessao } = require('./models/association');
const sessao = require('./models/Sessao');
app.use(express.json());
app.use(cors());

async function sincronizarTabelas() {
   

    await Card.sync({ alter: true });
    console.log('✅ Tabela Card sincronizada com sucesso.');

 await CardPrice.sync({ alter: true });
    console.log('✅ Tabela Cardprice sincronizada com sucesso.');
 await CardSet.sync({ alter: true });
    console.log('✅ Tabela cardset sincronizada com sucesso.');
 await CardImage.sync({ alter: true });
    console.log('✅ Tabela cardimage sincronizada com sucesso.');     
await User.sync({ alter: true });
    console.log('✅ Tabela User sincronizada com sucesso.');
 await Deck.sync({ alter: true });
    console.log('✅ Tabela Deck sincronizada com sucesso.');
 await DeckCard.sync({ alter: true });
    console.log('✅ Tabela DeckCard sincronizada com sucesso.');
     await sessao.sync({ alter: false });
    console.log('✅ Tabela Sessao sincronizada com sucesso.');
}





async function inicializarDataBase() {
    
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
    }
}
app.use('/users', userRoutes);
app.use('/cards',card);   
app.use('/Banco',populateRoutes);
app.use('/yugi',animationRotas);

app.use('/decks', deckRoutes);










async function startServer() {

    await inicializarDataBase();
    await sincronizarTabelas();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
    
}

startServer();
