using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using api.Enums;

namespace api.Models
{
    [JsonDerivedType(typeof(PessoaFisica), (int)TipoNatureza.Fisica)]
    [JsonDerivedType(typeof(PessoaJuridica), (int)TipoNatureza.Juridica)]
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "TipoNatureza")]
    public abstract class User
    {
        [Key]
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public TipoUser Papel { get; set; }
        public TipoNatureza TipoNatureza { get; set; }
        public virtual List<Address> Addresses { get; set; } = new();
        public virtual List<Telefone> Telefones { get; set; } = new();
        public virtual List<Pedido> Pedidos { get; set; } = new();
    }
}