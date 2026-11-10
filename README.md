# 🌸 IFlowey

Clone do iFood com temática de flores, feito em **React Native (Expo SDK 58)** e integrado ao backend
**Java / Spring Boot** do repositório [IFlower](https://github.com/GabrielHFPirolo/IFlower)
(API REST + JWT + PostgreSQL).

## Como rodar

### 1. Backend (na raiz do repositório IFlower)
```bash
docker compose up -d        # PostgreSQL + scripts database/01_schema.sql e 02_seed.sql
cd backend
mvn spring-boot:run         # http://localhost:8080
```
> ⚠️ No commit `5bbf080` do GitHub vários arquivos estão com marcadores de merge (`<<<<<<< HEAD`)
> e o backend **não compila**. Veja a seção "Problemas no repositório" abaixo.

### 2. App
```bash
npm install
npx expo start -c           # w = navegador · a = emulador Android · QR code = Expo Go
```

Contas de teste do seed (senha `Senha@123`): clientes `maria@iflower.com` e `joao@iflower.com`;
vendedores `ana@iflower.com` (Curitiba), `carlos@iflower.com` (Londrina) e `beatriz@iflower.com` (Curitiba).
A tela de login tem atalhos para preencher cliente e vendedora de teste.

### Endereço da API
Fica em **um único lugar**: `src/services/api.js`. Ele escolhe sozinho:

| Onde o app roda | URL usada |
|---|---|
| Celular/emulador via Expo Go (mesma rede Wi-Fi do PC) | `http://<IP do PC>:8080` (o mesmo IP que serve o app) |
| Emulador Android sem IP detectado | `http://10.0.2.2:8080` |
| Navegador / simulador iOS | `http://localhost:8080` |

Para forçar outro endereço (ex.: usando `--tunnel`, que não expõe o IP do PC), copie `.env.example`
para `.env` e ajuste `EXPO_PUBLIC_API_URL`. O endereço em uso aparece no rodapé da tela de login.
Se o celular não conectar, libere a porta 8080 no firewall do PC.

## Mapa de requisitos (RF = Requisitos_Atualizados.md do backend)

| RF | O que | Tela do app | Endpoint |
|---|---|---|---|
| 001/023 | Cadastro de cliente (CPF) e vendedor (CNPJ + loja) | `RegisterScreen` | `POST /api/clientes`, `/api/vendedores` |
| 002 | Login com JWT (sessão salva no aparelho) | `LoginScreen`, `AppContext` | `POST /api/auth/login` |
| 003/022 | Avaliar loja após receber pedido; editar/excluir | `TrackingScreen` | `/api/lojas/{id}/avaliacoes`, `/api/avaliacoes/{id}` |
| 004 | Lojas próximas (mesma cidade/UF) | `HomeScreen` | `GET /api/lojas/proximas` |
| 005 | Ver/editar dados, desativar conta | `ProfileScreen` | `/api/usuarios/me` |
| 006/018 | Carrinho (quantidade, personalização, remover, esvaziar) | `StoreScreen`, `CartScreen` | `/api/carrinho/**` |
| 007 | Buscar lojas por nome (+ cidade/UF) | `HomeScreen` | `GET /api/lojas?nome=` |
| 008/016 | Cadastrar, editar e excluir produtos | `SellerScreen`, `NewProductScreen` | `/api/produtos/**` |
| 009/011/012 | Finalizar compra: entrega ou retirada, data, horário, resumo | `CheckoutScreen` | `POST /api/pedidos` |
| 010/014 | Acompanhar pedido (atualiza a cada 8 s) e histórico | `TrackingScreen`, `OrdersScreen` | `GET /api/pedidos`, `/{id}` |
| 013/015 | Vendedor: pedidos da loja com filtro e troca de status | `OrdersScreen`, `TrackingScreen` | `GET /api/pedidos?status=`, `PATCH /{id}/status` |
| 017/021 | Cancelar pedido (cancela a entrega) | `TrackingScreen` | `POST /api/pedidos/{id}/cancelar` |
| 019/024 | Pagar com Pix, cartão ou boleto; vendedor confirma boleto | `CheckoutScreen`, `TrackingScreen` | `/api/pedidos/{id}/pagamento`, `/api/pagamentos/{id}/confirmar` |
| 020 | Perfil da loja (nome, descrição, endereço, horário) | `EditStoreScreen` | `PUT /api/lojas/me` |
| 025 | Loja com nota média e catálogo | `StoreScreen` | `GET /api/lojas/{id}`, `/{id}/produtos` |

RNF001 (compra em até 5 cliques): loja → "+" → carrinho → checkout → confirmar. Tudo já vem pré-selecionado
(entrega no endereço do cadastro, primeiro horário livre, Pix com o e-mail como chave).
RNF002: todos os botões têm texto e `accessibilityLabel`.

## O que mudou em relação à versão sem backend
- **Sem "Floricultura × Independente", taxa de entrega, distância e tempo estimado**: o backend não tem esses
  campos (todo vendedor é uma loja com CNPJ; "próximas" = mesma cidade). O total do pedido é só a soma dos itens.
- **Foto do produto vira link (URL)**: a API guarda apenas a URL, não há upload de arquivo.
  Sem foto ou com link quebrado, o app mostra um emoji.
- **Mensagem do cartão** é pedida na hora de adicionar ao carrinho (a API grava a personalização junto do item).
- **Pedido não avança sozinho**: quem muda o status é a loja (login de vendedor). O pagamento Pix/cartão
  confirma o pedido na hora; o boleto fica pendente até a loja confirmar a compensação.
- Carrinho, pedidos e avaliações ficam no servidor; só o token de login é guardado no aparelho.

## Estrutura
```
App.js                     navegação (cliente × vendedor)
src/services/api.js        URL base, token JWT, tratamento de erro padrão do backend
src/services/index.js      uma função por endpoint
src/context/AppContext.js  sessão e carrinho
src/hooks/useLoad.js       carrega dados da API ao abrir a tela
src/screens/               telas
src/components/            botões, campos, endereço, pagamento, cards...
```

## Problemas no repositório IFlower (encontrados na integração)
Estes arquivos do commit `5bbf080` contêm marcadores de conflito de merge e impedem o build:
`backend/pom.xml`, `backend/src/main/resources/application.properties`, `database/01_schema.sql`,
`database/02_seed.sql`, `README.md`, `docs/README.md`, os cinco enums em `model/enums/`,
`model/Entrega.java`, `model/pagamento/*` e `exception/*`. Em todos, o lado `HEAD` contém a versão completa
e o outro lado é uma versão antiga/vazia. O arquivo `iflower-conflitos-resolvidos.patch` (fora deste projeto)
aplica essa resolução, mas **não foi compilado** (não havia acesso ao Maven Central no ambiente em que foi gerado).

## Próximos passos sugeridos
Upload real de fotos, notificações push do status, geolocalização, e migrar o app para TypeScript
(a pasta `mobile/` do IFlower já prevê `types/` espelhando os DTOs).
