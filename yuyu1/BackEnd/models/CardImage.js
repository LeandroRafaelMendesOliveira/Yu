// models/CardImage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const CardImage = sequelize.define('CardImage', {
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
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  image_url_small: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  image_url_cropped: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'card_images',
  timestamps: false
});

module.exports = CardImage;