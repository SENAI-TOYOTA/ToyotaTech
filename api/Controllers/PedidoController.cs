using Microsoft.AspNetCore.Mvc;
using api.Models;
using api.Repositories;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PedidoController : ControllerBase
    {
        private readonly PedidoRepository _repository;

        public PedidoController(PedidoRepository repository)
        {
            _repository = repository;
        }

        // GET: api/Pedido
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidos()
        {
            var pedidos = await _repository.GetAll();
            return Ok(pedidos);
        }

        // GET: api/Pedido/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Pedido>> GetPedido(int id)
        {
            var pedido = await _repository.GetById(id);

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
            var pedidos = await _repository.GetByClienteId(idCliente);
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

            var novoPedido = await _repository.Create(pedido);
            return CreatedAtAction(nameof(GetPedido), new { id = novoPedido.IdPedido }, novoPedido);
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

            if (!await _repository.Exists(id))
            {
                return NotFound(new { message = "Pedido não encontrado" });
            }

            try
            {
                await _repository.Update(pedido);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar pedido", error = ex.Message });
            }
        }

        // DELETE: api/Pedido/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePedido(int id)
        {
            var deleted = await _repository.Delete(id);

            if (!deleted)
            {
                return NotFound(new { message = "Pedido não encontrado" });
            }

            return NoContent();
        }
    }
}