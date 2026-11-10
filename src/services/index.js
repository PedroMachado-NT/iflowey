// Uma função por endpoint do backend IFlower (Spring Boot). Cada comentário traz o RF atendido.
import { get, post, put, patch, del, qs } from './api';

export const authService = {
  login: (email, senha) => post('/api/auth/login', { email, senha }), // RF002
  cadastrarCliente: (dados) => post('/api/clientes', dados), // RF001
  cadastrarVendedor: (dados) => post('/api/vendedores', dados), // RF001/RF023
};

export const usuarioService = {
  me: () => get('/api/usuarios/me'),
  atualizar: (dados) => put('/api/usuarios/me', dados), // RF005
  desativar: () => del('/api/usuarios/me'), // RF005
};

export const lojaService = {
  listar: (filtros) => get('/api/lojas' + qs(filtros)), // RF007
  proximas: () => get('/api/lojas/proximas'), // RF004
  buscar: (id) => get(`/api/lojas/${id}`), // RF025
  produtos: (id) => get(`/api/lojas/${id}/produtos`), // RF025
  avaliacoes: (id) => get(`/api/lojas/${id}/avaliacoes`),
  minha: () => get('/api/lojas/me'), // RF020
  atualizarMinha: (dados) => put('/api/lojas/me', dados), // RF020
};

export const produtoService = {
  meus: () => get('/api/produtos/me'), // RF016
  criar: (dados) => post('/api/produtos', dados), // RF008
  atualizar: (id, dados) => put(`/api/produtos/${id}`, dados), // RF016
  excluir: (id) => del(`/api/produtos/${id}`), // RF016
};

export const carrinhoService = {
  obter: () => get('/api/carrinho'),
  adicionar: (produtoId, quantidade = 1, personalizacao) =>
    post('/api/carrinho/itens', { produtoId, quantidade, personalizacao: personalizacao || null }), // RF006
  alterarQuantidade: (itemId, quantidade) => put(`/api/carrinho/itens/${itemId}`, { quantidade }), // RF018
  remover: (itemId) => del(`/api/carrinho/itens/${itemId}`), // RF018
  limpar: () => del('/api/carrinho'), // RF018
};

export const pedidoService = {
  criar: (entrega) => post('/api/pedidos', { entrega }), // RF009/RF011
  listar: (status) => get('/api/pedidos' + qs({ status })), // RF013/RF014
  buscar: (id) => get(`/api/pedidos/${id}`), // RF010/RF012
  atualizarStatus: (id, status) => patch(`/api/pedidos/${id}/status`, { status }), // RF015
  cancelar: (id) => post(`/api/pedidos/${id}/cancelar`), // RF017/RF021
  pagar: (id, pagamento) => post(`/api/pedidos/${id}/pagamento`, pagamento), // RF019
};

export const pagamentoService = {
  confirmarBoleto: (id) => post(`/api/pagamentos/${id}/confirmar`), // RF024
};

export const avaliacaoService = {
  criar: (lojaId, nota, comentario) =>
    post(`/api/lojas/${lojaId}/avaliacoes`, { nota, comentario: comentario || null }), // RF003
  editar: (id, nota, comentario) => put(`/api/avaliacoes/${id}`, { nota, comentario: comentario || null }), // RF022
  excluir: (id) => del(`/api/avaliacoes/${id}`), // RF022
};
