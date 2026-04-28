using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data; // Adicionado
using api.Models;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VeiculoController : ControllerBase
    {
        // 1. Mudança: Injetar ApplicationDbContext
        private readonly ApplicationDbContext _context;

        // 2. Mudança: Construtor recebe ApplicationDbContext
        public VeiculoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Veiculo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Veiculo>>> GetVeiculos()
        {
            // 3. Mudança: Usar _context.Veiculo diretamente
            var veiculos = await _context.Veiculo.ToListAsync();
            return Ok(veiculos);
        }

        // GET: api/Veiculo/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Veiculo>> GetVeiculo(int id)
        {
            // 4. Mudança: Usar FindAsync no _context.Veiculo
            var veiculo = await _context.Veiculo.FindAsync(id);

            if (veiculo == null)
            {
                return NotFound(new { message = "Veículo não encontrado" });
            }

            return Ok(veiculo);
        }
        
        // ** Métodos GetByMarca e GetByModelo requerem reescrita com LINQ **
        // GET: api/Veiculo/Marca/Toyota
        [HttpGet("Marca/{marca}")]
        public async Task<ActionResult<IEnumerable<Veiculo>>> GetVeiculosPorMarca(string marca)
        {
            var veiculos = await _context.Veiculo
                .Where(v => v.Marca == marca) // Usando LINQ
                .ToListAsync();
            return Ok(veiculos);
        }

        // GET: api/Veiculo/Modelo/Corolla
        [HttpGet("Modelo/{modelo}")]
        public async Task<ActionResult<IEnumerable<Veiculo>>> GetVeiculosPorModelo(string modelo)
        {
            var veiculos = await _context.Veiculo
                .Where(v => v.Modelo == modelo) // Usando LINQ
                .ToListAsync();
            return Ok(veiculos);
        }

        // POST: api/Veiculo
        [HttpPost]
        public async Task<ActionResult<Veiculo>> PostVeiculo(Veiculo veiculo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // 5. Mudança: Usar Add e SaveChangesAsync
            _context.Veiculo.Add(veiculo);
            await _context.SaveChangesAsync();
            
            // NOTE: Ajuste o nome da propriedade da PK se não for 'IdVeiculo'
            return CreatedAtAction(nameof(GetVeiculo), new { id = veiculo.IdVeiculo }, veiculo);
        }

        // PUT: api/Veiculo/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVeiculo(int id, Veiculo veiculo)
        {
            if (id != veiculo.IdVeiculo)
            {
                return BadRequest(new { message = "ID do veículo não corresponde" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // 6. Mudança: Usar Entry e EntityState.Modified
            _context.Entry(veiculo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VeiculoExists(id)) // Usar método auxiliar
                {
                    return NotFound(new { message = "Veículo não encontrado" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Veiculo/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVeiculo(int id)
        {
            var veiculo = await _context.Veiculo.FindAsync(id);
            if (veiculo == null)
            {
                return NotFound(new { message = "Veículo não encontrado" });
            }

            // 7. Mudança: Usar Remove e SaveChangesAsync
            _context.Veiculo.Remove(veiculo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 8. Mudança: Adicionar método auxiliar EnderecoExists
        private bool VeiculoExists(int id)
        {
            return _context.Veiculo.Any(e => e.IdVeiculo == id);
        }
    }
}