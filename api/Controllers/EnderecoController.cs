using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;


namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnderecoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EnderecoController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Endereco>>> GetEnderecos()
        {
            return await _context.Endereco.Include(e => e.Usuario).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Endereco>> GetEndereco(int id)
        {
            var endereco = await _context.Endereco
                .Include(e => e.Usuario)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (endereco == null)
                return NotFound();

            return endereco;
        }

        [HttpPost]
        public async Task<ActionResult<Endereco>> PostEndereco(Endereco endereco)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Endereco.Add(endereco);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEndereco), new { id = endereco.Id }, endereco);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutEndereco(int id, Endereco endereco)
        {
            if (id != endereco.Id)
                return BadRequest();

            _context.Entry(endereco).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EnderecoExists(id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEndereco(int id)
        {
            var endereco = await _context.Endereco.FindAsync(id);
            if (endereco == null)
                return NotFound();

            _context.Endereco.Remove(endereco);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EnderecoExists(int id)
        {
            return _context.Endereco.Any(e => e.Id == id);
        }
    }
}