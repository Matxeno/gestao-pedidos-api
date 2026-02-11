namespace GestaoPedidos.Api.Models;

public class ItemPedido
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int ProdutoId { get; set; }
    public int Quantidade { get; set; }
    public int PrecoUnitarioCentavos { get; set; }

    public Produto? Produto { get; set; }
}