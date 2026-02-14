// models/CardSet.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const CardSet = sequelize.define('CardSet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  set_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  set_code: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  set_rarity: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  set_rarity_code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  set_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  card_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cards',
      key: 'id'
    }
  }
}, {
  tableName: 'card_sets',
  timestamps: false
});

module.exports = CardSet;