using System.Text.Json.Serialization;
using api.Models;

namespace api.Models{

public class PessoaJuridica : User
{
    public PessoaJuridica()
    {
        this.TipoNatureza = Enums.TipoNatureza.Juridica;
        this.Papel = Enums.TipoUser.Cliente;
    }
    public string RazaoSocial { get; set; } = string.Empty;
    public string NomeFantasia { get; set; } = string.Empty;
    public string CNPJ { get; set; } = string.Empty;
}
}