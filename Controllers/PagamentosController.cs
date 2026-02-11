using GestaoPedidos.Api.Data;
using GestaoPedidos.Api.DTOs;
using GestaoPedidos.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestaoPedidos.Api.Controllers;

[ApiController]
[Route("api/pagamentos")]
public class PagamentosController : ControllerBase
{
    private readonly AppDbContext _context;

    public PagamentosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public IActionResult Registrar(CriarPagamentoDto dto)
    {
        var pedido = _context.Pedidos
            .Include(p => p.Itens)
            .FirstOrDefault(p => p.Id == dto.IdPedido);

        if (pedido == null)
            return NotFound("Pedido não encontrado.");

        var totalPedido = pedido.Itens
            .Sum(i => i.Quantidade * i.PrecoUnitarioCentavos);

        var totalPago = _context.Pagamentos
            .Where(p => p.IdPedido == pedido.Id)
            .Sum(p => p.PrecoCentavos);

        var pagamento = new Pagamento
        {
            IdPedido = pedido.Id,
            Metodo = dto.Metodo,
            PrecoCentavos = dto.PrecoCentavos,
            PagoEm = DateTime.UtcNow
        };

        _context.Pagamentos.Add(pagamento);

        if (totalPago + dto.PrecoCentavos >= totalPedido)
            pedido.Status = "PAGO";

        _context.SaveChanges();

        return Ok();
    }
}