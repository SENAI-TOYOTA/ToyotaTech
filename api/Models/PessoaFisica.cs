using System.Text.Json.Serialization;
using api.Models;

namespace api.Models{

public class PessoaFisica : User
{
    [JsonIgnore]
    public virtual User? User { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Sobrenome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
}
}