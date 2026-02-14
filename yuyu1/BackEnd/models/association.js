// models/association.js
const Card = require('./Card');
const CardSet = require('./CardSet');
const CardImage = require('./CardImage');
const CardPrice = require('./CardPrice');
const User = require('./user');
const Deck = require('./deck');
const DeckCard = require('./DeckCard');
const Sessao = require('./Sessao');
const sequelize = require('../db/database');



// Associações existentes dos cards
Card.hasMany(CardSet, {
  foreignKey: 'card_id',
  as: 'card_sets'
});

CardSet.belongsTo(Card, {
  foreignKey: 'card_id',
  as: 'card'
});

Card.hasMany(CardImage, {
  foreignKey: 'card_id',
  as: 'card_images'
});

CardImage.belongsTo(Card, {
  foreignKey: 'card_id',
  as: 'card'
});

Card.hasOne(CardPrice, {
  foreignKey: 'card_id',
  as: 'card_prices'
});

CardPrice.belongsTo(Card, {
  foreignKey: 'card_id',
  as: 'card'
});

// NOVAS ASSOCIAÇÕES - Usuários e Decks

// User ↔ Deck (Um usuário tem muitos decks)
User.hasMany(Deck, {
  foreignKey: 'user_id',
  as: 'decks'
});

Deck.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Deck ↔ Card (Muitos para muitos através de DeckCard)
Deck.belongsToMany(Card, {
  through: DeckCard,
  foreignKey: 'deck_id',
  otherKey: 'card_id',
  as: 'cards'
});

Card.belongsToMany(Deck, {
  through: DeckCard,
  foreignKey: 'card_id',
  otherKey: 'deck_id',
  as: 'decks'
});

// Associações diretas para DeckCard
Deck.hasMany(DeckCard, {
  foreignKey: 'deck_id',
  as: 'deck_cards'
});

DeckCard.belongsTo(Deck, {
  foreignKey: 'deck_id',
  as: 'deck'
});

Card.hasMany(DeckCard, {
  foreignKey: 'card_id',
  as: 'deck_cards'
});

DeckCard.belongsTo(Card, {
  foreignKey: 'card_id',
  as: 'card'
});

// Deck tem uma carta destaque
Deck.belongsTo(Card, {
  foreignKey: 'featured_card_id',
  as: 'featured_card'
});

Card.hasMany(Deck, {
  foreignKey: 'featured_card_id',
  as: 'featured_in_decks'
});
Sessao.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});


// Exporta o sequelize e as associações

// Sincroniza os modelos com o banco de dados

module.exports = {
  sequelize,
  Card,
  CardSet,
  CardImage,
  CardPrice,
  User,
  Deck,
  DeckCard,
  Sessao
};