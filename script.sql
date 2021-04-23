IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE TABLE [Instructor] (
        [ID] int NOT NULL IDENTITY,
        [LastName] nvarchar(50) NOT NULL,
        [FirstName] nvarchar(50) NOT NULL,
        [HireDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Instructor] PRIMARY KEY ([ID])
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE TABLE [Student] (
        [ID] int NOT NULL IDENTITY,
        [LastName] nvarchar(50) NOT NULL,
        [FirstName] nvarchar(50) NOT NULL,
        [EnrollmentDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Student] PRIMARY KEY ([ID])
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE TABLE [Departments] (
        [DepartmentID] int NOT NULL IDENTITY,
        [Name] nvarchar(50) NULL,
        [Budget] money NOT NULL,
        [StartDate] datetime2 NOT NULL,
        [InstructorID] int NULL,
        CONSTRAINT [PK_Departments] PRIMARY KEY ([DepartmentID]),
        CONSTRAINT [FK_Departments_Instructor_InstructorID] FOREIGN KEY ([InstructorID]) REFERENCES [Instructor] ([ID]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE TABLE [OfficeAssignments] (
        [InstructorID] int NOT NULL,
        [Location] nvarchar(50) NULL,
        CONSTRAINT [PK_OfficeAssignments] PRIMARY KEY ([InstructorID]),
        CONSTRAINT [FK_OfficeAssignments_Instructor_InstructorID] FOREIGN KEY ([InstructorID]) REFERENCES [Instructor] ([ID]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE TABLE [Course] (
        [CourseID] int NOT NULL,
        [Title] nvarchar(50) NULL,
        [Credits] int NOT NULL,
        [DepartmentID] int NOT NULL,
        CONSTRAINT [PK_Course] PRIMARY KEY ([CourseID]),
        CONSTRAINT [FK_Course_Departments_DepartmentID] FOREIGN KEY ([DepartmentID]) REFERENCES [Departments] ([DepartmentID]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE TABLE [CourseInstructor] (
        [CoursesCourseID] int NOT NULL,
        [InstructorsID] int NOT NULL,
        CONSTRAINT [PK_CourseInstructor] PRIMARY KEY ([CoursesCourseID], [InstructorsID]),
        CONSTRAINT [FK_CourseInstructor_Course_CoursesCourseID] FOREIGN KEY ([CoursesCourseID]) REFERENCES [Course] ([CourseID]) ON DELETE CASCADE,
        CONSTRAINT [FK_CourseInstructor_Instructor_InstructorsID] FOREIGN KEY ([InstructorsID]) REFERENCES [Instructor] ([ID]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE TABLE [Enrollments] (
        [EnrollmentID] int NOT NULL IDENTITY,
        [CourseID] int NOT NULL,
        [StudentID] int NOT NULL,
        [Grade] int NULL,
        CONSTRAINT [PK_Enrollments] PRIMARY KEY ([EnrollmentID]),
        CONSTRAINT [FK_Enrollments_Course_CourseID] FOREIGN KEY ([CourseID]) REFERENCES [Course] ([CourseID]) ON DELETE CASCADE,
        CONSTRAINT [FK_Enrollments_Student_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [Student] ([ID]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE INDEX [IX_Course_DepartmentID] ON [Course] ([DepartmentID]);
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE INDEX [IX_CourseInstructor_InstructorsID] ON [CourseInstructor] ([InstructorsID]);
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE INDEX [IX_Departments_InstructorID] ON [Departments] ([InstructorID]);
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE INDEX [IX_Enrollments_CourseID] ON [Enrollments] ([CourseID]);
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    CREATE INDEX [IX_Enrollments_StudentID] ON [Enrollments] ([StudentID]);
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318003031_InitialCreate')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20210318003031_InitialCreate', N'5.0.3');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318042405_RowVersion')
BEGIN
    ALTER TABLE [Departments] ADD [ConcurrencyToken] rowversion NULL;
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210318042405_RowVersion')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20210318042405_RowVersion', N'5.0.3');
END;
GO

COMMIT;
GO

