// models/card.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const Card = sequelize.define('Card', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  frameType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'frame_type'
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  atk: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  def: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  scale: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  linkval: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  race: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  attribute: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  archetype: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'cards',
  timestamps: false
});

module.exports = Card;