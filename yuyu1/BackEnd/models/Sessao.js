const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');


const Sessao = sequelize.define('Sessao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false    
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
}, {
  tableName: 'Sessao',
  timestamps: true
});

module.exports =  Sessao  
