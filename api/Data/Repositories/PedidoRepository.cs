using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Data;

namespace api.Repositories
{
    public class PedidoRepository
    {
        private readonly ApplicationDbContext _context;

        public PedidoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // CREATE
        public async Task<Pedido> Create(Pedido pedido)
        {
            _context.Pedido.Add(pedido);
            await _context.SaveChangesAsync();
            return pedido;
        }

        // READ - Buscar todos
        public async Task<List<Pedido>> GetAll()
        {
            return await _context.Pedido.ToListAsync();
        }

        // READ - Buscar por ID
        public async Task<Pedido?> GetById(int id)
        {
            return await _context.Pedido.FindAsync(id);
        }

        // READ - Buscar pedidos por ID do cliente
        public async Task<List<Pedido>> GetByClienteId(int idCliente)
        {
            return await _context.Pedido
                .Where(p => p.IdCliente == idCliente)
                .ToListAsync();
        }

        // UPDATE
        public async Task<Pedido> Update(Pedido pedido)
        {
            _context.Entry(pedido).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return pedido;
        }

        // DELETE
        public async Task<bool> Delete(int id)
        {
            var pedido = await _context.Pedido.FindAsync(id);
            if (pedido == null)
                return false;

            _context.Pedido.Remove(pedido);
            await _context.SaveChangesAsync();
            return true;
        }

        // Verificar se existe
        public async Task<bool> Exists(int id)
        {
            return await _context.Pedido.AnyAsync(e => e.IdPedido == id);
        }
    }
}