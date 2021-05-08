using System;

namespace ContosoUniversitySPA.Models.SchoolViewModels
{
    public class StudentData
    {
        public int ID { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public DateTime EnrollmentDate { get; set; }
    }
}