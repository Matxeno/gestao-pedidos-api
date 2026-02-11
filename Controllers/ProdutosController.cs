using GestaoPedidos.Api.Data;
using GestaoPedidos.Api.DTOs;
using GestaoPedidos.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestaoPedidos.Api.Controllers;

    [ApiController]
    [Route("api/[controller]")]
    public class ProdutosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProdutosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> ListarProdutos(
            [FromQuery] string? categoria,
            [FromQuery] bool somenteAtivos = false)
        {
            var query = _context.Produtos.AsQueryable();

            if (!string.IsNullOrEmpty(categoria))
                query = query.Where(p => p.Categoria == categoria);

            if (somenteAtivos)
                query = query.Where(p => p.Ativo);

            return Ok(await query.ToListAsync());
        }
    }