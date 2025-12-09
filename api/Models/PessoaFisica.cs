using System.Text.Json.Serialization;
using api.Models;

namespace api.Models{

public class PessoaFisica : User
{
    public PessoaFisica()
    {
        this.TipoNatureza = Enums.TipoNatureza.Fisica;
        this.Papel = Enums.TipoUser.Cliente;
    }
    public string Nome { get; set; } = string.Empty;
    public string Sobrenome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
}
}