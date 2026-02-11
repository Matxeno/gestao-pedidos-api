Gestão de Pedidos API

Backend desenvolvido para a avaliação técnica Lynx SPA. A aplicação implementa uma mini API REST para gestão de pedidos, incluindo produtos, pedidos, itens e pagamentos, seguindo as regras de negócio propostas no enunciado.

Tecnologias:

.NET 8

Entity Framework Core

SQLite

Swagger

Execução:

Clonar o repositório
git clone <URL_DO_REPOSITORIO>
cd GestaoPedidos.Api

Restaurar dependências
dotnet restore

Executar
dotnet run

Swagger disponível em:
http://localhost:xxxx/swagger

(porta exibida no terminal)

Funcionalidades implementadas:

Listagem de produtos com filtros

Criação de pedidos com validação de itens

Listagem resumida de pedidos

Detalhamento de pedido com total calculado

Registro de pagamentos

Atualização automática de status para PAID

Regras de negócio:

Total do pedido = quantidade × preço unitário

Pedido só muda para PAID quando pagamentos ≥ total

Produtos inativos não podem ser adicionados

Tratamento de erros com mensagens claras

O banco SQLite é criado automaticamente na primeira execução.

Backend entregue conforme requisitos mínimos obrigatórios da avaliação.