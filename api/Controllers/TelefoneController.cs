using Microsoft.AspNetCore.Mvc;
using api.Models;
using api.Repositories;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TelefoneController : ControllerBase
    {
        private readonly TelefoneRepository _repository;

        public TelefoneController(TelefoneRepository repository)
        {
            _repository = repository;
        }

        // GET: api/Telefone
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Telefone>>> GetTelefones()
        {
            var telefones = await _repository.GetAll();
            return Ok(telefones);
        }

        // GET: api/Telefone/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Telefone>> GetTelefone(int id)
        {
            var telefone = await _repository.GetById(id);

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
            var telefones = await _repository.GetByClienteId(idCliente);
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

            var novoTelefone = await _repository.Create(telefone);
            return CreatedAtAction(nameof(GetTelefone), new { id = novoTelefone.IdTelefone }, novoTelefone);
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

            if (!await _repository.Exists(id))
            {
                return NotFound(new { message = "Telefone não encontrado" });
            }

            try
            {
                await _repository.Update(telefone);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar telefone", error = ex.Message });
            }
        }

        // DELETE: api/Telefone/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTelefone(int id)
        {
            var deleted = await _repository.Delete(id);

            if (!deleted)
            {
                return NotFound(new { message = "Telefone não encontrado" });
            }

            return NoContent();
        }
    }
}