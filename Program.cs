using GestaoPedidos.Api.Data;
using GestaoPedidos.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=gestao_pedidos.db"));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Gestão de Pedidos API",
        Version = "v1"
    });
});

// CORS (para o frontend rodando em outra porta)
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Cria o banco automaticamente e popula dados iniciais (seed)
using (var escopo = app.Services.CreateScope())
{
    var contexto = escopo.ServiceProvider.GetRequiredService<AppDbContext>();
    contexto.Database.EnsureCreated();

    // Seed inicial: cria produtos e um cliente de teste apenas se não existir nenhum produto
    if (!contexto.Produtos.Any())
    {
        contexto.Produtos.AddRange(
            new Produto { Nome = "Café", Categoria = "Bebidas", PrecoCentavos = 1200, Ativo = true },
            new Produto { Nome = "Refrigerante", Categoria = "Bebidas", PrecoCentavos = 800, Ativo = true },
            new Produto { Nome = "Hambúrguer", Categoria = "Comida", PrecoCentavos = 2500, Ativo = true },
            new Produto { Nome = "Produto Inativo", Categoria = "Teste", PrecoCentavos = 1000, Ativo = false }
        );

        contexto.Clientes.Add(new Cliente
        {
            Nome = "Cliente Teste",
            Email = "teste@email.com",
            CriadoEm = DateTime.UtcNow
        });

        contexto.SaveChanges();
    }
}

// Pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Gestão de Pedidos API v1");
});

app.UseCors("Frontend");

app.MapControllers();
app.Run();