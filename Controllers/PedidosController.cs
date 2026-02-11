using GestaoPedidos.Api.Data;
using GestaoPedidos.Api.DTOs;
using GestaoPedidos.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestaoPedidos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _context;

    public PedidosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var pedidos = await _context.Pedidos
            .Select(p => new
            {
                p.Id,
                p.Status,
                p.CriadoEm
            })
            .ToListAsync();

        return Ok(pedidos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Detalhes(int id)
    {
        var pedido = await _context.Pedidos
            .Include(p => p.Itens)
            .ThenInclude(i => i.Produto)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (pedido == null)
            return NotFound("Pedido não encontrado.");

        var total = pedido.Itens.Sum(i => i.Quantidade * i.PrecoUnitarioCentavos);

        return Ok(new
        {
            pedido.Id,
            pedido.Status,
            pedido.CriadoEm,
            TotalCentavos = total,
            Itens = pedido.Itens.Select(i => new
            {
                i.ProdutoId,
                ProdutoNome = i.Produto != null ? i.Produto.Nome : null,
                i.Quantidade,
                i.PrecoUnitarioCentavos,
                SubtotalCentavos = i.Quantidade * i.PrecoUnitarioCentavos
            })
        });
    }


 [HttpPost]
public async Task<IActionResult> Criar(CriarPedidoDto dto)
{
    if (dto.ClienteId <= 0)
        return BadRequest("ClienteId inválido.");

    if (dto.Itens == null || dto.Itens.Count == 0)
        return BadRequest("O pedido deve conter ao menos 1 item.");

    if (dto.Itens.Any(i => i.Quantidade <= 0))
        return BadRequest("Quantidade deve ser maior que 0.");

    var produtoIds = dto.Itens.Select(i => i.ProdutoId).Distinct().ToList();

    var produtos = await _context.Produtos
        .Where(p => produtoIds.Contains(p.Id))
        .ToListAsync();

    // valida se todos existem
    var encontrados = produtos.Select(p => p.Id).ToHashSet();
    var faltando = produtoIds.Where(id => !encontrados.Contains(id)).ToList();
    if (faltando.Count > 0)
        return BadRequest($"Produto(s) não encontrado(s): {string.Join(", ", faltando)}");

    // valida ativos
    var inativos = produtos.Where(p => !p.Ativo).Select(p => p.Id).ToList();
    if (inativos.Count > 0)
        return BadRequest($"Produto(s) inativo(s): {string.Join(", ", inativos)}");

    var pedido = new Pedido
    {
        ClienteId = dto.ClienteId,
        Status = "NEW",
        CriadoEm = DateTime.UtcNow,
        Itens = dto.Itens.Select(i =>
        {
            var prod = produtos.First(p => p.Id == i.ProdutoId);
            return new ItemPedido
            {
                ProdutoId = prod.Id,
                Quantidade = i.Quantidade,
                PrecoUnitarioCentavos = prod.PrecoCentavos
            };
        }).ToList()
    };

    _context.Pedidos.Add(pedido);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(Detalhes), new { id = pedido.Id }, new { pedido.Id });
}

}