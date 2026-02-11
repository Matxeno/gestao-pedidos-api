namespace GestaoPedidos.Api.Models;

    public class Produto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public int PrecoCentavos { get; set; }
        public bool Ativo { get; set; } = true;
    }

