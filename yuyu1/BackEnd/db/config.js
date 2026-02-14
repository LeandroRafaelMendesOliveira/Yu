// db/config.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'yugioh_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false, // Desativa createdAt e updatedAt
      freezeTableName: true // Previne pluralização automática
    }
  }
);

// Testar conexão
sequelize.authenticate()
  .then(() => console.log('✅ Conexão com o banco estabelecida'))
  .catch(error => console.error('❌ Erro de conexão:', error));

module.exports = sequelize;