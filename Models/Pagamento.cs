namespace GestaoPedidos.Api.Models;

public class Pagamento
{
    public int Id { get; set; }
    public int IdPedido { get; set; }
    public string Metodo { get; set; } = string.Empty;
    public int PrecoCentavos { get; set; }
    public DateTime PagoEm { get; set; }

    public Pedido? Pedido { get; set; }
}
