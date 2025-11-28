using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Data;

namespace api.Repositories
{
    public class TelefoneRepository
    {
        private readonly ApplicationDbContext _context;

        public TelefoneRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // CREATE
        public async Task<Telefone> Create(Telefone telefone)
        {
            _context.Telefone.Add(telefone);
            await _context.SaveChangesAsync();
            return telefone;
        }

        // READ - Buscar todos
        public async Task<List<Telefone>> GetAll()
        {
            return await _context.Telefone.ToListAsync();
        }

        // READ - Buscar por ID
        public async Task<Telefone> GetById(int id)
        {
            return await _context.Telefone.FindAsync(id);
        }

        // READ - Buscar telefones por ID do cliente
        public async Task<List<Telefone>> GetByClienteId(int idCliente)
        {
            return await _context.Telefone
                .Where(t => t.IdCliente == idCliente)
                .ToListAsync();
        }

        // UPDATE
        public async Task<Telefone> Update(Telefone telefone)
        {
            _context.Entry(telefone).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return telefone;
        }

        // DELETE
        public async Task<bool> Delete(int id)
        {
            var telefone = await _context.Telefone.FindAsync(id);
            if (telefone == null)
                return false;

            _context.Telefone.Remove(telefone);
            await _context.SaveChangesAsync();
            return true;
        }

        // Verificar se existe
        public async Task<bool> Exists(int id)
        {
            return await _context.Telefone.AnyAsync(e => e.IdTelefone == id);
        }
    }
}