using System.Text.Json.Serialization;
using api.Models;

namespace api.Models{

public class PessoaJuridica : User
{
    [JsonIgnore]
    public virtual User? User { get; set; }
    public string RazaoSocial { get; set; } = string.Empty;
    public string NomeFantasia { get; set; } = string.Empty;
    public string CNPJ { get; set; } = string.Empty;
}
}