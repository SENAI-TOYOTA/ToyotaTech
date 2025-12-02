using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Data;

namespace api.Repositories
{
    public class VeiculoRepository
    {
        private readonly ApplicationDbContext _context;

        public VeiculoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // CREATE
        public async Task<Veiculo> Create(Veiculo veiculo)
        {
            _context.Veiculo.Add(veiculo);
            await _context.SaveChangesAsync();
            return veiculo;
        }

        // READ - Buscar todos
        public async Task<List<Veiculo>> GetAll()
        {
            return await _context.Veiculo.ToListAsync();
        }

        // READ - Buscar por ID
        public async Task<Veiculo?> GetById(int id)
        {
            return await _context.Veiculo.FindAsync(id);
        }

        // READ - Buscar por marca
        public async Task<List<Veiculo>> GetByMarca(string marca)
        {
            return await _context.Veiculo
                .Where(v => v.Marca.Contains(marca))
                .ToListAsync();
        }

        // READ - Buscar por modelo
        public async Task<List<Veiculo>> GetByModelo(string modelo)
        {
            return await _context.Veiculo
                .Where(v => v.Modelo.Contains(modelo))
                .ToListAsync();
        }

        // UPDATE
        public async Task<Veiculo> Update(Veiculo veiculo)
        {
            _context.Entry(veiculo).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return veiculo;
        }

        // DELETE
        public async Task<bool> Delete(int id)
        {
            var veiculo = await _context.Veiculo.FindAsync(id);
            if (veiculo == null)
                return false;

            _context.Veiculo.Remove(veiculo);
            await _context.SaveChangesAsync();
            return true;
        }

        // Verificar se existe
        public async Task<bool> Exists(int id)
        {
            return await _context.Veiculo.AnyAsync(e => e.IdVeiculo == id);
        }
    }
}