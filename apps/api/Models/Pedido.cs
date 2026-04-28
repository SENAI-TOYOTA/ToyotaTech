using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace api.Models
{
    [Table("Pedido")]
    public class Pedido
    {
        [Key]
        [Column("id_pedido")]
        public int IdPedido { get; set; }

        [Required(ErrorMessage = "O ID do cliente é obrigatório")]
        [Column("id_cliente")]
        public int IdCliente { get; set; }

        [Required(ErrorMessage = "O ID do veículo é obrigatório")]
        [Column("id_veiculo")]
        public int IdVeiculo { get; set; }

        [Required(ErrorMessage = "O ID do vendedor é obrigatório")]
        [Column("id_vendedor")]
        public int IdVendedor { get; set; }

        [Required(ErrorMessage = "O ID do financiamento é obrigatório")]
        [Column("id_financiamento")]
        public int IdFinanciamento { get; set; }

        [Required(ErrorMessage = "A data do pedido é obrigatória")]
        [Column("data_pedido")]
        public DateTime DataPedido { get; set; }

        // Propriedade de navegação
        [JsonIgnore]
        public Usuario? ClienteUsuario { get; set; }
        [JsonIgnore]
        public Usuario? VendedorUsuario { get; set; }
    }
}