// migrations/create-yugioh-tables.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create cards table
    await queryInterface.createTable('cards', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      frame_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      desc: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      atk: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      def: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      race: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      attribute: {
        type: Sequelize.STRING(20),
        allowNull: true
      }
    });

    // Create card_sets table
    await queryInterface.createTable('card_sets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      set_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      set_code: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      set_rarity: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      set_rarity_code: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      set_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      card_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cards',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // Create card_images table
    await queryInterface.createTable('card_images', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      card_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cards',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      image_url_small: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      image_url_cropped: {
        type: Sequelize.STRING(500),
        allowNull: true
      }
    });

    // Create card_prices table
    await queryInterface.createTable('card_prices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      card_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cards',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cardmarket_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      tcgplayer_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      ebay_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      amazon_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      coolstuffinc_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('card_sets', ['card_id']);
    await queryInterface.addIndex('card_sets', ['set_code']);
    await queryInterface.addIndex('card_images', ['card_id']);
    await queryInterface.addIndex('card_prices', ['card_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('card_prices');
    await queryInterface.dropTable('card_images');
    await queryInterface.dropTable('card_sets');
    await queryInterface.dropTable('cards');
  }
};