using ContosoUniversitySPA.Data;
using ContosoUniversitySPA.Models;
using ContosoUniversitySPA.Models.SchoolViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.Identity.Web.Resource;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ContosoUniversitySPA.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly SchoolContext _context;
        private readonly GraphServiceClient _graphServiceClient;
        private readonly IConfiguration _configuration;

        static readonly string[] scopeRequiredByApi = new string[] { "access_as_user" };

        public StudentsController(SchoolContext context, GraphServiceClient graphServiceClient, IConfiguration configuration)
        {
            _context = context;
            _graphServiceClient = graphServiceClient;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentData>>> GetAsync()
        {
            HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            return await _context.Students
                            .Select(x => ItemToDTO(x))
                            .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StudentData>> GetAsync(int id)
        {
            HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            var item = await _context.Students
                 .FirstOrDefaultAsync(m => m.ID == id);

            if (item == null)
            {
                return NotFound();
            }

            return ItemToDTO(item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(int id, StudentData data)
        {
            HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            if (id != data.ID)
            {
                return BadRequest();
            }

            var item = await _context.Students.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.LastName = data.LastName;
            item.FirstMidName = data.FirstName;
            item.EnrollmentDate = data.EnrollmentDate;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!ItemExists(id))
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<CourseData>> CreateAsync(StudentData data)
        {
            HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            var item = new Student
            {
                FirstMidName = data.FirstName,
                LastName = data.LastName,
                EnrollmentDate = data.EnrollmentDate
            };

            _context.Students.Add(item);
            await _context.SaveChangesAsync();

            data = (await this.GetAsync(item.ID)).Value;

            return CreatedAtAction(
                nameof(GetAsync),
                new { id = item.ID },
                data);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            var item = await _context.Students.FindAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            _context.Students.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ItemExists(long id) => _context.Students.Any(e => e.ID == id);

        private static StudentData ItemToDTO(Student p) =>
            new()
            {
                ID = p.ID,
                LastName = p.LastName,
                FirstName = p.FirstMidName,
                EnrollmentDate = p.EnrollmentDate
            };
    }
}
