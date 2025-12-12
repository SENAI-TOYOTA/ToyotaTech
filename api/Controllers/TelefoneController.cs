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
    public class TelefoneController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TelefoneController(ApplicationDbContext context) // Mudança: Construtor alterado
        {
            _context = context;
        }

        // GET: api/Telefone
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Telefone>>> GetTelefones()
        {
            // Mudança: Acesso direto ao DbContext
            var telefones = await _context.Telefone.ToListAsync();
            return Ok(telefones);
        }

        // GET: api/Telefone/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Telefone>> GetTelefone(int id)
        {
            // Mudança: Acesso direto ao DbContext
            var telefone = await _context.Telefone.FindAsync(id);

            if (telefone == null)
            {
                return NotFound(new { message = "Telefone não encontrado" });
            }

            return Ok(telefone);
        }

        // GET: api/Telefone/Cliente/5
        [HttpGet("Cliente/{idCliente}")]
        public async Task<ActionResult<IEnumerable<Telefone>>> GetTelefonesPorCliente(int idCliente)
        {
            // Reescrita do método com LINQ
            var telefones = await _context.Telefone
                .Where(t => t.IdCliente == idCliente) // Assumindo que a PK do Cliente está aqui
                .ToListAsync();
            return Ok(telefones);
        }

        // POST: api/Telefone
        [HttpPost]
        public async Task<ActionResult<Telefone>> PostTelefone(Telefone telefone)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Mudança: Acesso direto ao DbContext
            _context.Telefone.Add(telefone);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetTelefone), new { id = telefone.IdTelefone }, telefone);
        }

        // PUT: api/Telefone/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTelefone(int id, Telefone telefone)
        {
            if (id != telefone.IdTelefone)
            {
                return BadRequest(new { message = "ID do telefone não corresponde" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Mudança: Acesso direto ao DbContext
            _context.Entry(telefone).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Telefone.Any(e => e.IdTelefone == id)) // Uso direto do Any()
                {
                    return NotFound(new { message = "Telefone não encontrado" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Telefone/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTelefone(int id)
        {
            // Mudança: Acesso direto ao DbContext
            var telefone = await _context.Telefone.FindAsync(id);

            if (telefone == null)
            {
                return NotFound(new { message = "Telefone não encontrado" });
            }

            _context.Telefone.Remove(telefone);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}