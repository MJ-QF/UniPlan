USE [UniPlan];
GO

CREATE OR ALTER PROCEDURE SP_StudentProfile_Insert
    @FirstName NVARCHAR(50),
    @MiddleName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @AccountName NVARCHAR(50),
    @Password NVARCHAR(255),
    @Email NVARCHAR(255),
    @StudentID INT OUTPUT,
    @MajorID INT,
    @PersonID INT OUTPUT,
    @AccountID INT OUTPUT,
    @Result BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @Result = 0;

    IF EXISTS (SELECT 1 FROM [dbo].[Students] WHERE StudentID = @StudentID)
        THROW 50302, '', 1;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[Majors] WHERE MajorID = @MajorID)
        THROW 50503, '', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        EXEC SP_People_Insert @FirstName, @MiddleName, @LastName, @PersonID OUTPUT;
        EXEC SP_Accounts_Insert @AccountName, @Password, @Email, @AccountID OUTPUT;

        INSERT INTO [dbo].[Students] ([PersonID], [AccountID], [MajorID])
        VALUES (@PersonID, @AccountID, @MajorID);

        SET @StudentID = SCOPE_IDENTITY();

        COMMIT;
        SET @Result = 1;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        SET @Result = 0;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE SP_StudentProfile_Update
    @StudentID INT,
    @FirstName NVARCHAR(50),
    @MiddleName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @AccountName NVARCHAR(50),
    @Email NVARCHAR(255),
    @MajorID INT,
    @Result BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @Result = 0;

    DECLARE @PersonID INT, @AccountID INT;
    SELECT @PersonID = PersonID, @AccountID = AccountID
    FROM [dbo].[Students]
    WHERE StudentID = @StudentID;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[Majors] WHERE MajorID = @MajorID)
        THROW 50503, '', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @PeopleResult BIT, @AccountResult BIT;

        EXEC SP_People_Update @PersonID, @FirstName, @MiddleName, @LastName, @PeopleResult OUTPUT;
        IF @PeopleResult = 0
            THROW 50103, '', 1;

        EXEC SP_Accounts_Update @AccountID, @AccountName, @Email, @AccountResult OUTPUT;
        IF @AccountResult = 0
            THROW 50403, '', 1;

        UPDATE [dbo].[Students]
        SET [MajorID] = @MajorID
        WHERE StudentID = @StudentID;

        COMMIT;
        SET @Result = 1;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        SET @Result = 0;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE SP_StudentProfile_Delete
    @StudentID INT,
    @Result BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @Result = 0;

    DECLARE @PersonID INT, @AccountID INT;
    SELECT @PersonID = PersonID, @AccountID = AccountID
    FROM [dbo].[Students]
    WHERE StudentID = @StudentID;

    IF @PersonID IS NULL OR @AccountID IS NULL
        THROW 50303, '', 1;

    IF EXISTS (SELECT 1 FROM [dbo].[StudentTerms] WHERE StudentID = @StudentID)
        THROW 50304, '', 1;

    IF EXISTS (SELECT 1 FROM [dbo].[StudentCourses] WHERE StudentID = @StudentID)
        THROW 50304, '', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM [dbo].[Students]
        WHERE StudentID = @StudentID;

        DECLARE @PeopleResult BIT, @AccountResult BIT;

        EXEC SP_People_Delete @PersonID, @PeopleResult OUTPUT;
        IF @PeopleResult = 0
            THROW 50103, '', 1;

        EXEC SP_Accounts_Delete @AccountID, @AccountResult OUTPUT;
        IF @AccountResult = 0
            THROW 50403, '', 1;

        COMMIT;
        SET @Result = 1;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        SET @Result = 0;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER VIEW StudentProfiles_view
AS
SELECT
    S.StudentID,
    P.PersonID,
    P.FirstName,
    P.MiddleName,
    P.LastName,
    A.AccountID,
    A.AccountName,
    A.Email,
    M.MajorID,
    M.MajorName,
	S.CompletedHours
FROM Students S
INNER JOIN People P ON S.PersonID = P.PersonID
INNER JOIN Accounts A ON S.AccountID = A.AccountID
INNER JOIN Majors M ON S.MajorID = M.MajorID;
GO

CREATE OR ALTER PROCEDURE SP_StudentProfile_GetAll
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    IF @PageNumber IS NULL OR @PageNumber < 1
        SET @PageNumber = 1;

    IF @PageSize IS NULL OR @PageSize < 1
        SET @PageSize = 10;

    SELECT * FROM StudentProfiles_view
    ORDER BY [StudentID]
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

CREATE OR ALTER PROCEDURE SP_StudentProfile_GetByAccountId
    @AccountID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM StudentProfiles_view
    WHERE AccountID = @AccountID;
END;
GO

CREATE OR ALTER PROCEDURE SP_StudentProfile_GetById
    @StudentID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM StudentProfiles_view
    WHERE StudentID = @StudentID;
END;
GO