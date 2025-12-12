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
    public class PedidoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PedidoController(ApplicationDbContext context) // Mudança: Construtor alterado
        {
            _context = context;
        }

        // GET: api/Pedido
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidos()
        {
            // Mudança: Acesso direto ao DbContext
            var pedidos = await _context.Pedido.ToListAsync();
            return Ok(pedidos);
        }

        // GET: api/Pedido/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Pedido>> GetPedido(int id)
        {
            // Mudança: Acesso direto ao DbContext
            var pedido = await _context.Pedido.FindAsync(id);

            if (pedido == null)
            {
                return NotFound(new { message = "Pedido não encontrado" });
            }

            return Ok(pedido);
        }

        // GET: api/Pedido/Cliente/5
        [HttpGet("Cliente/{idCliente}")]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidosPorCliente(int idCliente)
        {
            // Reescrita do método com LINQ
            var pedidos = await _context.Pedido
                .Where(p => p.IdCliente == idCliente) // Assumindo que a PK do Cliente está aqui
                .ToListAsync();
            return Ok(pedidos);
        }

        // POST: api/Pedido
        [HttpPost]
        public async Task<ActionResult<Pedido>> PostPedido(Pedido pedido)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Mudança: Acesso direto ao DbContext
            _context.Pedido.Add(pedido);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetPedido), new { id = pedido.IdPedido }, pedido);
        }

        // PUT: api/Pedido/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPedido(int id, Pedido pedido)
        {
            if (id != pedido.IdPedido)
            {
                return BadRequest(new { message = "ID do pedido não corresponde" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Mudança: Acesso direto ao DbContext
            _context.Entry(pedido).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Pedido.Any(e => e.IdPedido == id)) // Uso direto do Any()
                {
                    return NotFound(new { message = "Pedido não encontrado" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Pedido/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePedido(int id)
        {
            // Mudança: Acesso direto ao DbContext
            var pedido = await _context.Pedido.FindAsync(id);

            if (pedido == null)
            {
                return NotFound(new { message = "Pedido não encontrado" });
            }

            _context.Pedido.Remove(pedido);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}