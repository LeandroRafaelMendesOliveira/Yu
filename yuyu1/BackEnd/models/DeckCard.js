// models/DeckCard.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const DeckCard = sequelize.define('DeckCard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 3
    }
  },
  card_location: {
    type: DataTypes.ENUM('main', 'side', 'extra'),
    defaultValue: 'main'
  },

  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'deck_cards',
  timestamps: true
});

module.exports = DeckCard;