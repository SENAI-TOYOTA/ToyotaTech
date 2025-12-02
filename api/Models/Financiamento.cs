using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
public class Financiamento
{
    public int Id { get; set; }
    public string banco { get; set; }
    public decimal taxa_juros { get; set; }
}
}