using System.Text.Json.Serialization;

namespace api.Models
{
    public class Address
    {
        public int Id { get; set; }

        public int ClientId { get; set; }

        public string ZipCode { get; set; } = default!;

        public string Street { get; set; } = default!;

        public int Number { get; set; }

        public string Complement { get; set; } = default!;

        public string Neighborhood { get; set; } = default!;

        public string City { get; set; } = default!;

        public string State { get; set; } = default!;

        [JsonIgnore]
        public User? User { get; set; }
    }
}