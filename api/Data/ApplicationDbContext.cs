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
            
        public DbSet<User> User { get; set; } = default!;
        public DbSet<Address> Address { get; set; } = default!;
        public DbSet<Telefone> Telefone { get; set; } = default!;
        public DbSet<Pedido> Pedido { get; set; } = default!;
        public DbSet<Veiculo> Veiculo { get; set; } = default!;
        public DbSet<Financiamento> Financiamento { get; set; } = default!;


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Relacionamento User - Address
            modelBuilder.Entity<User>()
                .HasMany(u => u.Addresses)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relacionamento User - Telefone
            modelBuilder.Entity<User>()
                .HasMany(u => u.Telefones)
                .WithOne(t => t.User)
                .HasForeignKey(t => t.IdCliente)
                .OnDelete(DeleteBehavior.Cascade);

            // Relacionamento User - Pedido
            modelBuilder.Entity<User>()
                .HasMany(u => u.Pedidos)
                .WithOne(p => p.User)
                .HasForeignKey(p => p.IdCliente)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}