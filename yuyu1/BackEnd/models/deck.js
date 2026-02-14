// models/Deck.js
const { DataTypes}  = require('sequelize');
const sequelize = require('../db/database');

const Deck = sequelize.define('Deck', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deck_type: {
    type: DataTypes.ENUM('main', 'side', 'extra'),
    defaultValue: 'main'
  },
  format: {
    type: DataTypes.ENUM('tcg', 'ocg', 'rush', 'speed'),
    defaultValue: 'tcg'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  featured_card_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cards',
      key: 'id'
    }
  }
}, {
  tableName: 'decks',
  timestamps: true
});

module.exports = Deck;