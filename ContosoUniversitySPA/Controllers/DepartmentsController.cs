using ContosoUniversitySPA.Data;
using ContosoUniversitySPA.Models;
using ContosoUniversitySPA.Models.SchoolViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
    public class DepartmentsController : ControllerBase
    {
        private readonly SchoolContext _context;
        private readonly ILogger<CoursesController> _logger;

        static readonly string[] scopeRequiredByApi = new string[] { "access_as_user" };

        public DepartmentsController(ILogger<CoursesController> logger, SchoolContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DepartmentData>>> GetAsync()
        {
            //HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            return await _context.Departments
                            .Select(x => ItemToDTO(x))
                            .ToListAsync();
        }

        private bool ItemExists(long id) => _context.Courses.Any(e => e.CourseID == id);

        private static DepartmentData ItemToDTO(Department p) =>
            new()
            {
                DepartmentID = p.DepartmentID,
                Name = p.Name,
                Budget = p.Budget,
                StartDate = p.StartDate
            };
    }
}
