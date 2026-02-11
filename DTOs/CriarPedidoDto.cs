namespace GestaoPedidos.Api.DTOs;

public class CriarPedidoDto
{
    public int ClienteId { get; set; }
    public List<CriarItemPedidoDto> Itens { get; set; } = new();
}

public class CriarItemPedidoDto
{
    public int ProdutoId { get; set; }
    public int Quantidade { get; set; }
}
