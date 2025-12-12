using System.Text.Json.Serialization;

namespace api.Models
{
    public class Endereco
    {
        public int Id { get; set; }

        public int ClienteId { get; set; }

        public string CEP { get; set; } = default!;

        public string Rua { get; set; } = default!;

        public int Numero { get; set; }

        public string Complemento { get; set; } = default!;

        public string Bairro { get; set; } = default!;

        public string Cidade { get; set; } = default!;

        public string Estado { get; set; } = default!;

        [JsonIgnore]
        public Usuario? Usuario { get; set; }
    }
}