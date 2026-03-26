using System;
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
    public class PessoaJuridicaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PessoaJuridicaController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PessoaJuridica>>> GetPessoasJuridicas()
        {
            return await _context.Usuario
                .OfType<PessoaJuridica>()
                .Include(p => p.Enderecos)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PessoaJuridica>> GetPessoaJuridica(int id)
        {
            var pessoaJuridica = await _context.Usuario
                .OfType<PessoaJuridica>()
                .Include(p => p.Enderecos)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pessoaJuridica == null)
            {
                return NotFound();
            }

            return pessoaJuridica;
        }

        [HttpPost]
        public async Task<ActionResult<PessoaJuridica>> PostPessoaJuridica(PessoaJuridica pessoaJuridica)
        {
            _context.Add(pessoaJuridica);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetPessoaJuridica), new { id = pessoaJuridica.Id }, pessoaJuridica);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPessoaJuridica(int id, PessoaJuridica pessoaJuridica)
        {
            if (id != pessoaJuridica.Id)
            {
                return BadRequest();
            }

            _context.Entry(pessoaJuridica).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PessoaJuridicaExists(id))
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
        public async Task<IActionResult> DeletePessoaJuridica(int id)
        {
            var pessoaJuridica = await _context.Usuario
                .OfType<PessoaJuridica>()
                .FirstOrDefaultAsync(p => p.Id == id);
            
            if (pessoaJuridica == null)
            {
                return NotFound();
            }

            _context.Usuario.Remove(pessoaJuridica);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PessoaJuridicaExists(int id)
        {
            return _context.Usuario.OfType<PessoaJuridica>().Any(p => p.Id == id);
        }
    }
}
