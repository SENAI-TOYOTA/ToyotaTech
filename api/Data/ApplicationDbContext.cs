using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuario { get; set; } = default!;
        public DbSet<Endereco> Endereco { get; set; } = default!;
        public DbSet<Telefone> Telefone { get; set; } = default!;
        public DbSet<Pedido> Pedido { get; set; } = default!;
        public DbSet<Veiculo> Veiculo { get; set; } = default!;
        public DbSet<Financiamento> Financiamento { get; set; } = default!;
        public DbSet<PessoaFisica> PessoaFisica { get; set; } = default!;
        public DbSet<PessoaJuridica> PessoaJuridica { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Usuario>()
                .HasMany(u => u.Enderecos)
                .WithOne(e => e.Usuario)
                .HasForeignKey(e => e.ClienteId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Usuario>()
                .HasMany(u => u.Telefones)
                .WithOne(t => t.Usuario)
                .HasForeignKey(t => t.IdCliente)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Pedido>()
                .HasOne(p => p.ClienteUsuario)
                .WithMany()
                .HasForeignKey(p => p.IdCliente)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Pedido>()
                .HasOne(p => p.VendedorUsuario)
                .WithMany()
                .HasForeignKey(p => p.IdVendedor)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
