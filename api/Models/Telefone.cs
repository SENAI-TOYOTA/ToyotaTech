using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Telefone")]
    public class Telefone
    {
        [Key]
        [Column("id_telefone")]
        public int IdTelefone { get; set; }

        [Required(ErrorMessage = "O ID do cliente é obrigatório")]
        [Column("id_cliente")]
        public int IdCliente { get; set; }

        [Required(ErrorMessage = "O número de telefone é obrigatório")]
        [StringLength(20, ErrorMessage = "O número deve ter no máximo 20 caracteres")]
        [Column("numero")]
        public string Numero { get; set; } = string.Empty;

        // Propriedade de navegação
        public User? User { get; set; }
    }
}