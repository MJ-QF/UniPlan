/* =========================================================
   UniPlan corrected schema

   Important SQL Server note:
   - CREATE OR ALTER works for procedures, functions, views, and triggers.
   - It does NOT work for tables.
   - For tables, use: DROP TABLE IF EXISTS, then CREATE TABLE.
========================================================= */

IF DB_ID(N'UniPlan') IS NULL
BEGIN
    CREATE DATABASE [UniPlan];
END;
GO

USE [UniPlan];
GO

/* =========================================================
   FIX TAG: RERUN SCRIPT SAFELY
   Reason: Tables do not support CREATE OR ALTER.
   Drop child tables first, then parent tables.
========================================================= */

DROP TABLE IF EXISTS [dbo].[SessionTimeSlots];
DROP TABLE IF EXISTS [dbo].[MajorCourses];
DROP TABLE IF EXISTS [dbo].[ScheduleDetails];
DROP TABLE IF EXISTS [dbo].[GeneratedSchedules];
DROP TABLE IF EXISTS [dbo].[WishListItems];
DROP TABLE IF EXISTS [dbo].[WishLists];
DROP TABLE IF EXISTS [dbo].[StudentTerms];
DROP TABLE IF EXISTS [dbo].[StudentCourses];
DROP TABLE IF EXISTS [dbo].[CourseSessions];
DROP TABLE IF EXISTS [dbo].[CourseOfferings];
DROP TABLE IF EXISTS [dbo].[CoursePrerequisites];
DROP TABLE IF EXISTS [dbo].[Lectures];
DROP TABLE IF EXISTS [dbo].[Courses];
DROP TABLE IF EXISTS [dbo].[TimeSlots];
DROP TABLE IF EXISTS [dbo].[Periods];
DROP TABLE IF EXISTS [dbo].[Halls];
DROP TABLE IF EXISTS [dbo].[Students];
DROP TABLE IF EXISTS [dbo].[Administrators];
DROP TABLE IF EXISTS [dbo].[AcademicTerms];
DROP TABLE IF EXISTS [dbo].[Majors];
DROP TABLE IF EXISTS [dbo].[Accounts];
DROP TABLE IF EXISTS [dbo].[People];
GO

CREATE TABLE [dbo].[People]
(
    [PersonID] int IDENTITY(1,1) NOT NULL,
    [FirstName] nvarchar(50) NOT NULL,
    [MiddleName] nvarchar(50) NULL,
    [LastName] nvarchar(50) NOT NULL,

    CONSTRAINT [PK_People] PRIMARY KEY CLUSTERED ([PersonID]),

    /* FIX TAG: PERSON NAME VALIDATION */
    CONSTRAINT [CK_People_FirstName_NotEmpty]
        CHECK (NULLIF(LTRIM(RTRIM([FirstName])), N'') IS NOT NULL),
    CONSTRAINT [CK_People_LastName_NotEmpty]
        CHECK (NULLIF(LTRIM(RTRIM([LastName])), N'') IS NOT NULL),
    CONSTRAINT [CK_People_MiddleName_NotEmpty_WhenProvided]
        CHECK ([MiddleName] IS NULL OR NULLIF(LTRIM(RTRIM([MiddleName])), N'') IS NOT NULL)
);
GO

CREATE TABLE [dbo].[Accounts]
(
    [AccountID] int IDENTITY(1,1) NOT NULL,
    [AccountName] nvarchar(50) NOT NULL,
    [Password] nvarchar(255) NOT NULL,
    [Email] nvarchar(255) NOT NULL,

    CONSTRAINT [PK_Accounts] PRIMARY KEY CLUSTERED ([AccountID]),

    /* FIX TAG: ACCOUNT DUPLICATES */
    CONSTRAINT [UQ_Accounts_AccountName] UNIQUE ([AccountName]),
    CONSTRAINT [UQ_Accounts_Email] UNIQUE ([Email]),

    /* FIX TAG: ACCOUNT EMPTY VALUE VALIDATION */
    CONSTRAINT [CK_Accounts_AccountName_NotEmpty]
        CHECK (NULLIF(LTRIM(RTRIM([AccountName])), N'') IS NOT NULL),
    CONSTRAINT [CK_Accounts_Password_NotEmpty]
        CHECK (NULLIF(LTRIM(RTRIM([Password])), N'') IS NOT NULL),
    CONSTRAINT [CK_Accounts_Email_NotEmpty]
        CHECK (NULLIF(LTRIM(RTRIM([Email])), N'') IS NOT NULL),

    /* FIX TAG: BASIC EMAIL FORMAT */
    CONSTRAINT [CK_Accounts_Email_Format]
        CHECK ([Email] LIKE N'%_@_%._%')
);
GO

CREATE TABLE [dbo].[Majors]
(
    [MajorID] int IDENTITY(1,1) NOT NULL,
    [MajorName] nvarchar(100) NOT NULL,
    [ParentMajorID] int,

    CONSTRAINT [PK_Majors] PRIMARY KEY CLUSTERED ([MajorID]),

    /* FIX TAG: MAJOR DUPLICATES */
    CONSTRAINT [UQ_Majors_MajorName] UNIQUE ([MajorName]),
    
    CONSTRAINT FK_Majors_ParentMajor FOREIGN KEY ([ParentMajorID]) REFERENCES [dbo].[Majors]([MajorID]),

    CONSTRAINT [CK_Majors_MajorName_NotEmpty]
        CHECK (NULLIF(LTRIM(RTRIM([MajorName])), N'') IS NOT NULL)
);
GO

CREATE TABLE [dbo].[AcademicTerms]
(
    [TermID] int IDENTITY(1,1) NOT NULL,
    [TermType] int NOT NULL,
    [TermYear] int NOT NULL,

    CONSTRAINT [PK_AcademicTerms] PRIMARY KEY CLUSTERED ([TermID]),

    /* FIX TAG: ACADEMIC TERM VALIDATION */
    CONSTRAINT [UQ_AcademicTerms_TermType_TermYear] UNIQUE ([TermType], [TermYear]),
    CONSTRAINT [CK_AcademicTerms_TermType]
        CHECK ([TermType] IN (1, 2, 3)),
    CONSTRAINT [CK_AcademicTerms_TermYear]
        CHECK ([TermYear] BETWEEN 2000 AND 2100)
);
GO

CREATE TABLE [dbo].[Administrators]
(
    [AdminID] int IDENTITY(1,1) NOT NULL,
    [IsActive] bit NOT NULL
        CONSTRAINT [DF_Administrators_IsActive] DEFAULT ((1)),
    [PersonID] int NOT NULL,
    [AccountID] int NOT NULL,

    CONSTRAINT [PK_Administrators] PRIMARY KEY CLUSTERED ([AdminID]),

    /* FIX TAG: ADMINISTRATOR DUPLICATES */
    CONSTRAINT [UQ_Administrators_PersonID] UNIQUE ([PersonID]),
    CONSTRAINT [UQ_Administrators_AccountID] UNIQUE ([AccountID]),

    CONSTRAINT [FK_Admin_People]
        FOREIGN KEY ([PersonID]) REFERENCES [dbo].[People] ([PersonID]),
    CONSTRAINT [FK_Admin_Account]
        FOREIGN KEY ([AccountID]) REFERENCES [dbo].[Accounts] ([AccountID])
);
GO

CREATE TABLE [dbo].[Students]
(
    /* FIX TAG: STUDENT ID DESIGN
       Keep this as NOT IDENTITY if StudentID is a real university number.
       If SQL Server should generate it, change to: int IDENTITY(1,1) NOT NULL.
    */
    [StudentID] int IDENTITY(1,1) NOT NULL,
    [PersonID] int NOT NULL,
    [AccountID] int NOT NULL,
    [MajorID] int NOT NULL,
	[CompletedHours] int default 0,
    [NeededHours] int not null default 0,



    CONSTRAINT [PK_Students] PRIMARY KEY CLUSTERED ([StudentID]),

    /* FIX TAG: STUDENT DUPLICATES */
    CONSTRAINT [UQ_Students_PersonID] UNIQUE ([PersonID]),
    CONSTRAINT [UQ_Students_AccountID] UNIQUE ([AccountID]),

    CONSTRAINT [FK_Student_People]
        FOREIGN KEY ([PersonID]) REFERENCES [dbo].[People] ([PersonID]),
    CONSTRAINT [FK_Student_Account]
        FOREIGN KEY ([AccountID]) REFERENCES [dbo].[Accounts] ([AccountID]),
    CONSTRAINT [FK_Student_Major]
        FOREIGN KEY ([MajorID]) REFERENCES [dbo].[Majors] ([MajorID])
);
GO

CREATE TABLE [dbo].[Halls]
(
    [HallID] int IDENTITY(1,1) NOT NULL,
    [HallName] nvarchar(50) NOT NULL,
    [Building] nvarchar(50) NULL,
    [Floor] int NULL,
    [CreatedByAdminID] int NULL,

    CONSTRAINT [PK_Halls] PRIMARY KEY CLUSTERED ([HallID]),

    /* FIX TAG: HALL VALIDATION */
    CONSTRAINT [UQ_Halls_HallName_Building] UNIQUE ([HallName], [Building]),
    CONSTRAINT [CK_Halls_HallName_NotEmpty]
        CHECK (NULLIF(LTRIM(RTRIM([HallName])), N'') IS NOT NULL),
    CONSTRAINT [CK_Halls_Floor]
        CHECK ([Floor] IS NULL OR [Floor] >= 0),

    /* FIX TAG: ADMIN CREATED RECORD DELETE LOGIC */
    CONSTRAINT [FK_Hall_Admin]
        FOREIGN KEY ([CreatedByAdminID]) REFERENCES [dbo].[Administrators] ([AdminID])
        ON DELETE SET NULL
);
GO

CREATE TABLE [dbo].[Periods]
(
    [PeriodID] int IDENTITY(1,1) NOT NULL,
    [StartTime] time(7) NOT NULL,
    [EndTime] time(7) NOT NULL,

    CONSTRAINT [PK_Periods] PRIMARY KEY CLUSTERED ([PeriodID]),

    /* FIX TAG: PERIOD TIME VALIDATION */
    CONSTRAINT [CK_Periods_StartBeforeEnd] CHECK ([StartTime] < [EndTime]),
    CONSTRAINT [UQ_Periods_StartTime_EndTime] UNIQUE ([StartTime], [EndTime])
);
GO

CREATE TABLE [dbo].[TimeSlots]
(
    [SlotID] int IDENTITY(1,1) NOT NULL,
    [DayNum] int NOT NULL,
    [PeriodID] int NOT NULL,

    CONSTRAINT [PK_TimeSlots] PRIMARY KEY CLUSTERED ([SlotID]),

    /* FIX TAG: TIME SLOT VALIDATION */
    CONSTRAINT [CK_TimeSlots_DayNum] CHECK ([DayNum] BETWEEN 0 AND 6),
    CONSTRAINT [UQ_TimeSlots_DayNum_PeriodID] UNIQUE ([DayNum], [PeriodID]),

    CONSTRAINT [FK_TimeSlot_Period]
        FOREIGN KEY ([PeriodID]) REFERENCES [dbo].[Periods] ([PeriodID])
);
GO

CREATE TABLE [dbo].[Courses]
(
    [CourseID] int IDENTITY(1,1) NOT NULL,
    [CourseName] nvarchar(100) NOT NULL,
    [CreditHours] int NOT NULL,
    [CourseCode] nvarchar(8) NULL,
	[NeededHours] int default 0,


    CONSTRAINT [PK_Courses] PRIMARY KEY CLUSTERED ([CourseID]),

    /* FIX TAG: COURSE VALIDATION */
    CONSTRAINT [CK_Courses_CourseName_NotEmpty]
        CHECK (NULLIF(LTRIM(RTRIM([CourseName])), N'') IS NOT NULL),
    CONSTRAINT [CK_Courses_CreditHours] CHECK ([CreditHours] > 0),
);
GO

CREATE TABLE [dbo].[MajorCourses]
(
    [MajorCourseID] int IDENTITY(1,1) NOT NULL,
    [MajorID] int NOT NULL,
    [CourseID] int NOT NULL,

    CONSTRAINT [PK_MajorCourses]
        PRIMARY KEY CLUSTERED ([MajorCourseID]),

    CONSTRAINT [UQ_MajorCourses_MajorID_CourseID]
        UNIQUE ([MajorID], [CourseID]),

    CONSTRAINT [FK_MajorCourses_Major]
        FOREIGN KEY ([MajorID])
        REFERENCES [dbo].[Majors]([MajorID])
        ON DELETE CASCADE,

    CONSTRAINT [FK_MajorCourses_Course]
        FOREIGN KEY ([CourseID])
        REFERENCES [dbo].[Courses]([CourseID])
        ON DELETE CASCADE
);
GO

CREATE TABLE [dbo].[Lectures]
(
    [LectureID] int IDENTITY(1,1) NOT NULL,
    [LectureType] int NOT NULL,
    [DurationValue] int NOT NULL,
    [CourseID] int NOT NULL,

    CONSTRAINT [PK_Lectures] PRIMARY KEY CLUSTERED ([LectureID]),

    /* FIX TAG: LECTURE VALIDATION */
    CONSTRAINT [CK_Lectures_LectureType_NotEmpty]
        CHECK (NULLIF(LTRIM(RTRIM([LectureType])), N'') IS NOT NULL),
    CONSTRAINT [CK_Lectures_DurationValue] CHECK ([DurationValue] > 0),

    /* FIX TAG: COURSE OFFERING CONSISTENCY SUPPORT */
    CONSTRAINT [UQ_Lectures_LectureID_CourseID] UNIQUE ([LectureID], [CourseID]),

    CONSTRAINT [FK_Lecture_Course]
        FOREIGN KEY ([CourseID]) REFERENCES [dbo].[Courses] ([CourseID])
);
GO

CREATE TABLE [dbo].[CoursePrerequisites]
(
    [PrerequisiteID] int IDENTITY(1,1) NOT NULL,
    [CourseID] int NOT NULL,
    [PrerequisiteCourseID] int NOT NULL,

    CONSTRAINT [PK_CoursePrerequisites] PRIMARY KEY CLUSTERED ([PrerequisiteID]),

    /* FIX TAG: COURSE PREREQUISITE LOGIC */
    CONSTRAINT [CK_CoursePrerequisites_NotSameCourse]
        CHECK ([CourseID] <> [PrerequisiteCourseID]),
    CONSTRAINT [UQ_CoursePrerequisites_Course_Prerequisite]
        UNIQUE ([CourseID], [PrerequisiteCourseID]),

    CONSTRAINT [FK_Prereq_Course]
        FOREIGN KEY ([CourseID]) REFERENCES [dbo].[Courses] ([CourseID]),
    CONSTRAINT [FK_Prereq_ReqCourse]
        FOREIGN KEY ([PrerequisiteCourseID]) REFERENCES [dbo].[Courses] ([CourseID])
);
GO

CREATE TABLE [dbo].[CourseOfferings]
(
    [OfferingID] int IDENTITY(1,1) NOT NULL,
    [SectionNumber] int NOT NULL,
    [TermID] int NOT NULL,
    [LectureID] int NOT NULL,
    [CreatedByAdminID] int NULL,
    [CourseID] int NOT NULL,

    CONSTRAINT [PK_CourseOfferings] PRIMARY KEY CLUSTERED ([OfferingID]),

    /* FIX TAG: COURSE OFFERING VALIDATION */
    CONSTRAINT [CK_CourseOfferings_SectionNumber] CHECK ([SectionNumber] > 0),
    CONSTRAINT [UQ_CourseOfferings_Term_Course_Lecture_Section]
        UNIQUE ([TermID], [CourseID], [LectureID], [SectionNumber]),

    CONSTRAINT [FK_Offering_Term]
        FOREIGN KEY ([TermID]) REFERENCES [dbo].[AcademicTerms] ([TermID]),
    CONSTRAINT [FK_Offering_Course]
        FOREIGN KEY ([CourseID]) REFERENCES [dbo].[Courses] ([CourseID]),
    CONSTRAINT [FK_Offering_Lecture]
        FOREIGN KEY ([LectureID]) REFERENCES [dbo].[Lectures] ([LectureID]),

    /* FIX TAG: COURSE OFFERING CONSISTENCY */
    CONSTRAINT [FK_Offering_Lecture_Course]
        FOREIGN KEY ([LectureID], [CourseID])
        REFERENCES [dbo].[Lectures] ([LectureID], [CourseID]),

    /* FIX TAG: ADMIN CREATED RECORD DELETE LOGIC */
    CONSTRAINT [FK_Offering_Admin]
        FOREIGN KEY ([CreatedByAdminID]) REFERENCES [dbo].[Administrators] ([AdminID])
        ON DELETE SET NULL
);
GO

CREATE TABLE [dbo].[CourseSessions]
(
    [SessionID] int IDENTITY(1,1) NOT NULL,
    [OfferingID] int NOT NULL,
    [HallID] int NOT NULL,
    [CreatedByAdminID] int NULL,

    CONSTRAINT [PK_CourseSessions] PRIMARY KEY CLUSTERED ([SessionID]),

    CONSTRAINT [FK_Session_Offering]
        FOREIGN KEY ([OfferingID]) REFERENCES [dbo].[CourseOfferings] ([OfferingID]),
    CONSTRAINT [FK_Session_Hall]
        FOREIGN KEY ([HallID]) REFERENCES [dbo].[Halls] ([HallID]),

    /* FIX TAG: ADMIN CREATED RECORD DELETE LOGIC */
    CONSTRAINT [FK_Session_Admin]
        FOREIGN KEY ([CreatedByAdminID]) REFERENCES [dbo].[Administrators] ([AdminID])
        ON DELETE SET NULL
);
GO

CREATE TABLE [dbo].[SessionTimeSlots] (
    [SessionSlotID] INT IDENTITY(1,1) NOT NULL,
    [SessionID] INT NOT NULL,
    [SlotID] INT NOT NULL,
    
    CONSTRAINT [PK_SessionTimeSlots] PRIMARY KEY CLUSTERED ([SessionSlotID]),
    
    CONSTRAINT [UQ_SessionTimeSlots_Session_Slot] UNIQUE ([SessionID], [SlotID]),
    
    CONSTRAINT [FK_SessionTimeSlots_CourseSessions] FOREIGN KEY ([SessionID]) 
        REFERENCES [dbo].[CourseSessions] ([SessionID]) ON DELETE CASCADE,
        
    CONSTRAINT [FK_SessionTimeSlots_TimeSlots] FOREIGN KEY ([SlotID]) 
        REFERENCES [dbo].[TimeSlots] ([SlotID])
);
GO


CREATE TABLE [dbo].[StudentCourses]
(
    [EnrollmentID] int IDENTITY(1,1) NOT NULL,
    [IsPassed] bit NOT NULL
        CONSTRAINT [DF_StudentCourses_IsPassed] DEFAULT ((0)),
    [StudentID] int NOT NULL,
    [CourseID] int NOT NULL,

    CONSTRAINT [PK_StudentCourses] PRIMARY KEY CLUSTERED ([EnrollmentID]),

    /* FIX TAG: STUDENT COURSE DUPLICATES */
    CONSTRAINT [UQ_StudentCourses_StudentID_CourseID] UNIQUE ([StudentID], [CourseID]),

    CONSTRAINT [FK_StudentCourses_Student]
        FOREIGN KEY ([StudentID]) REFERENCES [dbo].[Students] ([StudentID]),
    CONSTRAINT [FK_StudentCourses_Course]
        FOREIGN KEY ([CourseID]) REFERENCES [dbo].[Courses] ([CourseID])
);
GO

CREATE TABLE [dbo].[StudentTerms]
(
    [RegistrationID] int IDENTITY(1,1) NOT NULL,
    [StudentID] int NOT NULL,
    [TermID] int NOT NULL,

    CONSTRAINT [PK_StudentTerms] PRIMARY KEY CLUSTERED ([RegistrationID]),

    /* FIX TAG: STUDENT TERM DUPLICATES */
    CONSTRAINT [UQ_StudentTerms_StudentID_TermID] UNIQUE ([StudentID], [TermID]),

    CONSTRAINT [FK_StudentTerms_Student]
        FOREIGN KEY ([StudentID]) REFERENCES [dbo].[Students] ([StudentID]),
    CONSTRAINT [FK_StudentTerms_Term]
        FOREIGN KEY ([TermID]) REFERENCES [dbo].[AcademicTerms] ([TermID])
);
GO

CREATE TABLE [dbo].[WishLists]
(
    [WishListID] int IDENTITY(1,1) NOT NULL,
    [RegistrationID] int NOT NULL,

    CONSTRAINT [PK_WishLists] PRIMARY KEY CLUSTERED ([WishListID]),

    CONSTRAINT [FK_WishList_Registration]
        FOREIGN KEY ([RegistrationID]) REFERENCES [dbo].[StudentTerms] ([RegistrationID])
);
GO

CREATE TABLE [dbo].[WishListItems]
(
    [ItemID] int IDENTITY(1,1) NOT NULL,
    [WishListID] int NOT NULL,
    [CourseID] int NOT NULL,

    CONSTRAINT [PK_WishListItems] PRIMARY KEY CLUSTERED ([ItemID]),

    /* FIX TAG: WISHLIST ITEM DUPLICATES */
    CONSTRAINT [UQ_WishListItems_WishListID_CourseID] UNIQUE ([WishListID], [CourseID]),

    CONSTRAINT [FK_WishListItem_WishList]
        FOREIGN KEY ([WishListID]) REFERENCES [dbo].[WishLists] ([WishListID]),
    CONSTRAINT [FK_WishListItem_Course]
        FOREIGN KEY ([CourseID]) REFERENCES [dbo].[Courses] ([CourseID])
);
GO

CREATE TABLE [dbo].[GeneratedSchedules]
(
    [ScheduleID] int IDENTITY(1,1) NOT NULL,
    [WishListID] int NOT NULL,

    CONSTRAINT [PK_GeneratedSchedules] PRIMARY KEY CLUSTERED ([ScheduleID]),

    /* FIX TAG: GENERATED SCHEDULE DUPLICATES */
    CONSTRAINT [UQ_GeneratedSchedules_WishListID] UNIQUE ([WishListID]),

    CONSTRAINT [FK_GeneratedSchedule_WishList]
        FOREIGN KEY ([WishListID]) REFERENCES [dbo].[WishLists] ([WishListID])
);
GO


CREATE TABLE [dbo].[ScheduleDetails]
(
    [DetailID] int IDENTITY(1,1) NOT NULL,
    [ScheduleID] int NOT NULL,
    [OfferingID] int NOT NULL,
    [ScheduleNum] INT NOT NULL

    CONSTRAINT [PK_ScheduleDetails] PRIMARY KEY CLUSTERED ([DetailID]),

    /* FIX TAG: SCHEDULE DETAIL DUPLICATES */
    CONSTRAINT [UQ_ScheduleDetails_ScheduleID_OfferingID_ScheduleNum] UNIQUE ([ScheduleID], [OfferingID], [ScheduleNum]),

    CONSTRAINT [FK_ScheduleDetail_Schedule]
        FOREIGN KEY ([ScheduleID]) REFERENCES [dbo].[GeneratedSchedules] ([ScheduleID]),
    CONSTRAINT [FK_ScheduleDetail_Offering]
        FOREIGN KEY ([OfferingID]) REFERENCES [dbo].[CourseOfferings] ([OfferingID])
);
GO
