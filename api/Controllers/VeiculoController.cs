using Microsoft.AspNetCore.Mvc;
using api.Models;
using api.Repositories;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VeiculoController : ControllerBase
    {
        private readonly VeiculoRepository _repository;

        public VeiculoController(VeiculoRepository repository)
        {
            _repository = repository;
        }

        // GET: api/Veiculo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Veiculo>>> GetVeiculos()
        {
            var veiculos = await _repository.GetAll();
            return Ok(veiculos);
        }

        // GET: api/Veiculo/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Veiculo>> GetVeiculo(int id)
        {
            var veiculo = await _repository.GetById(id);

            if (veiculo == null)
            {
                return NotFound(new { message = "Veículo não encontrado" });
            }

            return Ok(veiculo);
        }

        // GET: api/Veiculo/Marca/Toyota
        [HttpGet("Marca/{marca}")]
        public async Task<ActionResult<IEnumerable<Veiculo>>> GetVeiculosPorMarca(string marca)
        {
            var veiculos = await _repository.GetByMarca(marca);
            return Ok(veiculos);
        }

        // GET: api/Veiculo/Modelo/Corolla
        [HttpGet("Modelo/{modelo}")]
        public async Task<ActionResult<IEnumerable<Veiculo>>> GetVeiculosPorModelo(string modelo)
        {
            var veiculos = await _repository.GetByModelo(modelo);
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

            var novoVeiculo = await _repository.Create(veiculo);
            return CreatedAtAction(nameof(GetVeiculo), new { id = novoVeiculo.IdVeiculo }, novoVeiculo);
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

            if (!await _repository.Exists(id))
            {
                return NotFound(new { message = "Veículo não encontrado" });
            }

            try
            {
                await _repository.Update(veiculo);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar veículo", error = ex.Message });
            }
        }

        // DELETE: api/Veiculo/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVeiculo(int id)
        {
            var deleted = await _repository.Delete(id);

            if (!deleted)
            {
                return NotFound(new { message = "Veículo não encontrado" });
            }

            return NoContent();
        }
    }
}