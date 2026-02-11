namespace GestaoPedidos.Api.DTOs;

public class CriarPagamentoDto
{
    public int IdPedido { get; set; }
    public string Metodo { get; set; } = string.Empty;
    public int PrecoCentavos { get; set; }
}
