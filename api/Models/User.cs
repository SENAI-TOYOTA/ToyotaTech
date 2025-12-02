using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public virtual List<Address> Addresses { get; set; } = new();
        public virtual List<Telefone> Telefones { get; set; } = new();
        public virtual List<Pedido> Pedidos { get; set; } = new();
    }
}