namespace GestaoPedidos.Api.Models;

public class Pedido
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string Status { get; set; } = "NEW";
    public DateTime CriadoEm { get; set; }

    public List<ItemPedido> Itens { get; set; } = new();
    public List<Pagamento> Pagamentos { get; set; } = new();
}