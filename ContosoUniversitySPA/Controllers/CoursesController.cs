﻿using ContosoUniversitySPA.Data;
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
    public class CoursesController : ControllerBase
    {
        private readonly SchoolContext _context;
        private readonly ILogger<CoursesController> _logger;
        private readonly GraphServiceClient _graphServiceClient;

        static readonly string[] scopeRequiredByApi = new string[] { "access_as_user" };

        public CoursesController(ILogger<CoursesController> logger, SchoolContext context, GraphServiceClient graphServiceClient)
        {
            _logger = logger;
            _context = context;
            _graphServiceClient = graphServiceClient;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseData>>> GetAsync()
        {
            //HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            return await _context.Courses
                            .Include(c => c.Department)
                            .Select(x => ItemToDTO(x))
                            .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CourseData>> GetAsync(int id)
        {
            //HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

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
            //HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

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
            //HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

            var course = new Course
            {
                CourseID = courseData.CourseID,
                Title = courseData.Title,
                Credits = courseData.Credits,
                DepartmentID = courseData.DepartmentID
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            #region SendActivity
            await _graphServiceClient.Teams["fe6ebd09-1908-4b5f-aaef-7c96e9ab7e9b"].SendActivityNotification(
                new TeamworkActivityTopic()
                {
                    Source = TeamworkActivityTopicSource.EntityUrl,
                    Value = "https://graph.microsoft.com/v1.0/teams/fe6ebd09-1908-4b5f-aaef-7c96e9ab7e9b"
                },
                "courseCreated",
                null,
                new ItemBody()
                {
                    Content = "A new Course has been added"
                },
                new List<Microsoft.Graph.KeyValuePair>()
                {
                    new Microsoft.Graph.KeyValuePair()
                    {
                        Name = "courseName",
                        Value = courseData.Title
                    }
                },
                new AadUserNotificationRecipient()
                {
                    ODataType = "microsoft.graph.aadUserNotificationRecipient",
                    UserId = "258368cf-55aa-4958-a43b-3e4e5f823d60"
                }
            ).Request().PostAsync();
            #endregion

            return CreatedAtAction(
                nameof(GetAsync),
                new { id = course.CourseID },
                ItemToDTO(course));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            //HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

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
