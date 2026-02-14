// services/userService.js
const { User, Deck } = require('../models/association');

class UserService {
  async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{
          model: Deck,
          as: 'decks',
          attributes: ['id', 'name', 'description', 'createdAt'],
          limit: 5
        }]
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return user;

    } catch (error) {
      throw new Error(`Erro ao obter perfil: ${error.message}`);
    }
  }

  async updateUserProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const allowedFields = ['username', 'email', 'bio', 'profile_picture'];
      const updateFields = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields[field] = updateData[field];
        }
      });

      await user.update(updateFields);

      return user;

    } catch (error) {
      throw new Error(`Erro ao atualizar perfil: ${error.message}`);
    }
  }

  async listUsers(options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      };

    } catch (error) {
      throw new Error(`Erro ao listar usuários: ${error.message}`);
    }
  }

  async getUserStats(userId) {
    try {
      const [user, deckCount] = await Promise.all([
        User.findByPk(userId, {
          attributes: { exclude: ['password'] }
        }),
        Deck.count({ where: { user_id: userId } })
      ]);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return {
        user,
        stats: {
          total_decks: deckCount,
          member_since: user.createdAt,
          last_login: user.last_login
        }
      };

    } catch (error) {
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }

  async deactivateUser(userId) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      await user.update({ is_active: false });

      return { message: 'Usuário desativado com sucesso' };

    } catch (error) {
      throw new Error(`Erro ao desativar usuário: ${error.message}`);
    }
  }
}

module.exports = new UserService();