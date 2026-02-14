// models/CardPrice.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const CardPrice = sequelize.define('CardPrice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  card_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cards',
      key: 'id'
    }
  },
  cardmarket_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tcgplayer_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  ebay_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  amazon_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  coolstuffinc_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'card_prices',
  timestamps: false
});

module.exports = CardPrice;