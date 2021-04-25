using ContosoUniversitySPA.Data;
using ContosoUniversitySPA.Models;
using ContosoUniversitySPA.Models.SchoolViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Web.Resource;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ContosoUniversitySPA.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly SchoolContext _context;
        private readonly ILogger<CoursesController> _logger;

        static readonly string[] scopeRequiredByApi = new string[] { "access_as_user" };

        public CoursesController(ILogger<CoursesController> logger, SchoolContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseData>>> GetAsync()
        {
            HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            return await _context.Courses
                            .Include(c => c.Department)
                            .Select(x => ItemToDTO(x))
                            .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CourseData>> GetAsync(int id)
        {
            HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            var course = await _context.Courses
                 .Include(c => c.Department)
                 .FirstOrDefaultAsync(m => m.CourseID == id);

            if (course == null)
            {
                return NotFound();
            }

            return ItemToDTO(course);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(int id, CourseData courseData)
        {
            HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            if (id != courseData.CourseID)
            {
                return BadRequest();
            }

            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            course.Title = courseData.Title;
            course.Credits = courseData.Credits;
            course.DepartmentID = courseData.DepartmentID;

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
        public async Task<ActionResult<CourseData>> CreateAsync(CourseData courseData)
        {
            HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            var course = new Course
            {
                CourseID = courseData.CourseID,
                Title = courseData.Title,
                Credits = courseData.Credits,
                DepartmentID = courseData.DepartmentID
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetAsync),
                new { id = course.CourseID },
                ItemToDTO(course));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            var course = await _context.Courses.FindAsync(id);

            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ItemExists(long id) => _context.Courses.Any(e => e.CourseID == id);

        private static CourseData ItemToDTO(Course p) =>
            new()
            {
                CourseID = p.CourseID,
                Title = p.Title,
                Credits = p.Credits,
                DepartmentID = p.DepartmentID,
                DepartmentName = p.Department.Name
            };
    }
}
