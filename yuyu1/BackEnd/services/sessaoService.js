// sessaoService.js

// CORREÇÃO AQUI - remova as chaves se for export default
const Sessao = require('../models/Sessao'); // ← Importação corrigida
const User = require('../models/user');

async function criarSessao(userId, token) {
  try {
    console.log("Criando sessão para userId:", userId);
    console.log("Modelo Sessao disponível?", !!Sessao);
    
    const novaSessao = await Sessao.create({    
      userId,
      token
    });
    console.log("Sessão criada com sucesso:", novaSessao.id);
    return novaSessao;
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    throw error;
  }
}

async function encerrarSessao(token) {
  try {
    const resultado = await Sessao.destroy({ where: { token } });
    return resultado;
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
    throw error;
  }
}

async function encerrarSessaoPorUserId(userId) {
  try {
    const resultado = await Sessao.destroy({ where: { userId } });    
    return resultado;
  } catch (error) {
    console.error('Erro ao encerrar sessão por userId:', error);
    throw error;
  }
}

async function obterSessaoPorToken(token) {
  try {
    console.log("Token no service:", token);
    
    // Debug: verifique se o modelo está carregado
    if (!Sessao) {
      console.error("ERRO: Modelo Sessao está undefined!");
      throw new Error('Modelo Sessao não foi carregado corretamente');
    }
    
    if (!Sessao.findOne) {
      console.error("ERRO: Sessao.findOne não existe!");
      console.log("O que é Sessao?", typeof Sessao, Sessao);
      throw new Error('Método findOne não disponível no modelo');
    }
    
    const sessao = await Sessao.findOne({ where: { token } });
    return sessao;
  } catch (error) {
    console.error('Erro ao obter sessão por token:', error);
    throw error;
  }
}

module.exports = {
  criarSessao,
  encerrarSessao,
  obterSessaoPorToken,
  encerrarSessaoPorUserId
};