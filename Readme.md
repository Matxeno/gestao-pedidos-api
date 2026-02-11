# Gestão de Pedidos — Avaliação Técnica

Mini aplicação de gestão de pedidos desenvolvida como solução para avaliação técnica.

O projeto é composto por:

- Backend REST em ASP.NET Core (.NET 8)
- Banco SQLite
- Frontend simples em HTML/CSS/JavaScript puro

A aplicação permite listar produtos, criar pedidos, visualizar detalhes e registrar pagamentos.

---

## Funcionalidades

### Backend

- Listagem de produtos com filtros
- Listagem resumida de pedidos
- Detalhes do pedido com total calculado
- Criação de pedidos com validações
- Registro de pagamentos
- Atualização automática de status do pedido
- Validação de produtos ativos
- Tratamento de erros com mensagens claras

### Frontend

- Busca e filtro de produtos
- Carrinho local em JavaScript
- Totalizador automático
- Finalização de pedido
- Registro de pagamento
- Lista de pedidos
- Detalhes ao clicar
- UI simples e responsiva

---

## Tecnologias

- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- HTML / CSS / JavaScript

---

## Como executar

### 1. Backend

Dentro da pasta da API:

dotnet run


A API será iniciada e o Swagger ficará disponível em:

http://localhost:PORT/swagger

*(a porta aparece no terminal após o run)*

---

### 2. Frontend

Abra o arquivo:
frontend/index.html


Recomendado usar a extensão **Live Server** do VS Code.

---

## Observações

- O banco SQLite é criado automaticamente na primeira execução
- Não é necessário instalar banco externo
- O frontend consome a API local

---

## Autor

Mateus Xenofonte

