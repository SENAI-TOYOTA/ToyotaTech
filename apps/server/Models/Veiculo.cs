using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("Veiculo")]
    public class Veiculo
    {
        [Key]
        [Column("id_veiculo")]
        public int IdVeiculo { get; set; }

        [Required(ErrorMessage = "O modelo é obrigatório")]
        [StringLength(100, ErrorMessage = "O modelo deve ter no máximo 100 caracteres")]
        [Column("modelo")]
        public string Modelo { get; set; } = string.Empty;

        [Required(ErrorMessage = "A marca é obrigatória")]
        [StringLength(50, ErrorMessage = "A marca deve ter no máximo 50 caracteres")]
        [Column("marca")]
        public string Marca { get; set; } = string.Empty;

        [Required(ErrorMessage = "O ano é obrigatório")]
        [Column("ano")]
        public int Ano { get; set; }
    }
}