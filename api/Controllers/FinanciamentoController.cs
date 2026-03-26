using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinanciamentoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FinanciamentoController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Financiamento>>> GetFinanciamentos()
        {
            return await _context.Financiamento.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Financiamento>> GetFinanciamento(int id)
        {
            var financiamento = await _context.Financiamento.FindAsync(id);

            if (financiamento == null)
            {
                return NotFound();
            }

            return financiamento;
        }

        [HttpPost]
        public async Task<ActionResult<Financiamento>> PostFinanciamento(Financiamento financiamento)
        {
            _context.Add(financiamento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFinanciamento), new { id = financiamento.Id }, financiamento);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutFinanciamento(int id, Financiamento financiamento)
        {
            if (id != financiamento.Id)
            {
                return BadRequest();
            }

            _context.Entry(financiamento).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FinanciamentoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFinanciamento(int id)
        {
            var financiamento = await _context.Financiamento.FindAsync(id);
            if (financiamento == null)
            {
                return NotFound();
            }

            _context.Financiamento.Remove(financiamento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FinanciamentoExists(int id)
        {
            return _context.Financiamento.Any(e => e.Id == id);
        }
    }
}
