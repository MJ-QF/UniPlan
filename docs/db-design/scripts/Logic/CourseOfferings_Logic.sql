USE UniPlan;
GO

CREATE OR ALTER PROCEDURE SP_CourseOfferings_Validate
    @SectionNumber int,
    @TermID int,
    @LectureID int,
    @CreatedByAdminID int = NULL,
    @CourseID int,
    @OfferingID int = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[AcademicTerms] WHERE TermID = @TermID)
        RETURN 51103;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[Lectures] WHERE LectureID = @LectureID)
        RETURN 51403;

    IF @CreatedByAdminID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[Administrators] WHERE AdminID = @CreatedByAdminID)
        RETURN 50103;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[Courses] WHERE CourseID = @CourseID)
        RETURN 50903;

    IF EXISTS (
        SELECT 1
        FROM [dbo].[CourseOfferings]
        WHERE TermID = @TermID
          AND CourseID = @CourseID
          AND LectureID = @LectureID
          AND SectionNumber = @SectionNumber
          AND (@OfferingID IS NULL OR OfferingID != @OfferingID)
    )
        RETURN 51202;

    IF @OfferingID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[CourseOfferings] WHERE OfferingID = @OfferingID)
        RETURN 51203;

    RETURN 0;
END;
GO

CREATE OR ALTER PROCEDURE SP_CourseOfferings_Insert
    @NumberOfSections int,
    @TermID int,
    @LectureType int,
    @CreatedByAdminID int = NULL,
    @CourseID int,
    @Result bit output
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ErrCode int;

    DECLARE @LectureID INT = ( 
                    SELECT LectureID FROM Lectures 
                    WHERE LectureType = @LectureType 
                    AND CourseID = @CourseID
                );

    EXEC @ErrCode = SP_CourseOfferings_Validate
        NULL, @TermID, @LectureID, @CreatedByAdminID, @CourseID, NULL;

    IF @ErrCode != 0
        THROW @ErrCode, '', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @NextSectionNumber int = (
            SELECT ISNULL(MAX(SectionNumber), 0)
            FROM CourseOfferings
            WHERE TermID = @TermID
              AND LectureID = @LectureID
        );

        DECLARE @RemainingSections int = @NumberOfSections;

        WHILE @RemainingSections > 0
        BEGIN
            SET @NextSectionNumber += 1;

            INSERT INTO [dbo].[CourseOfferings]
                ([SectionNumber], [TermID], [LectureID], [CreatedByAdminID], [CourseID])
            VALUES
                (@NextSectionNumber, @TermID, @LectureID, @CreatedByAdminID, @CourseID);

            SET @RemainingSections -= 1;
        END;

        COMMIT TRANSACTION;

        SET @Result = 1;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @Result = 0;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE SP_CourseOfferings_Update
    @OfferingID int,
    @SectionNumber int,
    @TermID int,
    @LectureID int,
    @CourseID int,
    @Result bit OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SET @Result = 0;

    DECLARE @ErrCode int;

    EXEC @ErrCode = SP_CourseOfferings_Validate
        @SectionNumber, @TermID, @LectureID, NULL, @CourseID, @OfferingID;

    IF @ErrCode != 0
        THROW @ErrCode, '', 1;

    BEGIN TRY
        UPDATE [dbo].[CourseOfferings]
        SET [SectionNumber] = @SectionNumber,
            [TermID] = @TermID,
            [LectureID] = @LectureID,
            [CourseID] = @CourseID
        WHERE OfferingID = @OfferingID;

        IF @@ROWCOUNT > 0
            SET @Result = 1;
        ELSE
            SET @Result = 0;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE SP_CourseOfferings_Delete
    @OfferingID int,
    @Result bit OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SET @Result = 0;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[CourseOfferings] WHERE OfferingID = @OfferingID)
        THROW 51203, '', 1;


    IF EXISTS (SELECT 1 FROM [dbo].[CourseSessions] WHERE OfferingID = @OfferingID)
        THROW 51204, '', 1;

    BEGIN TRY
        DELETE FROM [dbo].[CourseOfferings]
        WHERE OfferingID = @OfferingID;

        IF @@ROWCOUNT > 0
            SET @Result = 1;
        ELSE
            SET @Result = 0;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER VIEW CourseOfferings_view
AS
SELECT L.*, T.TermID, T.TermYear, T.TermType,
       O.OfferingID, O.CreatedByAdminID, O.SectionNumber
FROM CourseOfferings O
INNER JOIN Lectures_view L ON O.LectureID = L.LectureID
INNER JOIN AcademicTerms T ON O.TermID = T.TermID;
GO

CREATE OR ALTER PROCEDURE SP_CourseOfferings_GetById
    @OfferingID int
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT * FROM CourseOfferings_view
        WHERE OfferingID = @OfferingID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE SP_CourseOfferings_Search
    @TermID int = NULL,
    @CourseName nvarchar(200) = NULL,
    @PageNumber int = 1,
    @PageSize int = 10
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF @PageNumber IS NULL OR @PageNumber < 1
            SET @PageNumber = 1;

        IF @PageSize IS NULL OR @PageSize < 1
            SET @PageSize = 10;

        SET @CourseName = NULLIF(LTRIM(RTRIM(@CourseName)), '');

        SELECT *
        FROM CourseOfferings_view
        WHERE (@TermID IS NULL OR TermID = @TermID)
          AND (@CourseName IS NULL OR CourseName LIKE N'%' + @CourseName + N'%')
        ORDER BY OfferingID
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
        OPTION (RECOMPILE);
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO