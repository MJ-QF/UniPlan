USE [UniPlan];
GO


DROP PROCEDURE IF EXISTS SP_GeneratedSchedules_Insert;
GO

DROP TYPE IF EXISTS IdListType;
GO

CREATE TYPE IdListType AS TABLE
(
    OfferingID INT,
    ScheduleNum INT
)
GO

CREATE OR ALTER PROCEDURE SP_GeneratedSchedules_Insert
    @WishListID int,
    @OfferingIDs IdListType READONLY,
    @ScheduleID int OUTPUT,
    @Result bit OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[WishLists] WHERE WishListID = @WishListID)
        THROW 51703, '', 1; 

    IF EXISTS (SELECT 1 FROM [dbo].[GeneratedSchedules] WHERE WishListID = @WishListID)
        THROW 51902, '', 1;

    BEGIN TRY
        BEGIN TRANSACTION
            INSERT INTO [dbo].[GeneratedSchedules] ([WishListID])
            VALUES (@WishListID);
            
            SET @ScheduleID = CONVERT(int, SCOPE_IDENTITY());

            INSERT INTO [dbo].[ScheduleDetails] ([ScheduleID] ,[OfferingID], [ScheduleNum])
            SELECT DISTINCT @ScheduleID, OfferingID, ScheduleNum FROM @OfferingIDs;
            
        COMMIT;
        SET @Result = 1;     
    END TRY
    BEGIN CATCH
        ROLLBACK;
        SET @Result = 0;
        -- CHANGED: THROW keeps the original error details.
        THROW;
    END CATCH
END;
GO


CREATE OR ALTER VIEW GeneratedSchedules_view
AS
    SELECT G.ScheduleID, W.*
    FROM GeneratedSchedules G
    JOIN WishLists_view W ON G.WishListID = W.WishListID
GO

CREATE OR ALTER VIEW ScheduleDetails_view
AS
    SELECT CS.CourseID, CS.CourseName, CS.CourseCode, CS.LectureID, CS.LectureType, CS.SectionNumber, CS.OfferingID,
        CS.SessionID, CS.DayNum, CS.StartTime, CS.EndTime, S.ScheduleID, S.ScheduleNum
    FROM ScheduleDetails S
    JOIN CourseSessions_view CS ON CS.OfferingID = S.OfferingID
GO

CREATE OR ALTER PROCEDURE SP_GeneratedSchedules_GetByWishListID
    @WishListID int
AS
BEGIN
    SET NOCOUNT ON
    
    DECLARE @ScheduleID INT;

    BEGIN TRY
        SELECT @ScheduleID = ScheduleID FROM GeneratedSchedules
        WHERE WishListID = @WishListID;

        SELECT * FROM GeneratedSchedules_view G
        WHERE ScheduleID = @ScheduleID;
    END TRY
    BEGIN CATCH
        -- CHANGED: THROW keeps the original error details.
        THROW;
    END CATCH

END;
GO

CREATE OR ALTER PROCEDURE SP_GeneratedSchedules_GetByStudentID
    @StudentID int,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON
    
    DECLARE @ScheduleID INT;

     IF @PageNumber < 1
        SET @PageNumber = 1;

    IF @PageSize < 1
        SET @PageSize = 10;

    BEGIN TRY
        SELECT @ScheduleID = ScheduleID FROM GeneratedSchedules GS
        INNER JOIN WishLists W ON W.WishListID = GS.WishListID
        INNER JOIN StudentTerms ST ON ST.RegistrationID = W.RegistrationID
        WHERE StudentID = @StudentID;

        SELECT * FROM GeneratedSchedules_view G
        WHERE ScheduleID = @ScheduleID
        ORDER BY ScheduleID DESC 
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;

    END TRY
    BEGIN CATCH
        -- CHANGED: THROW keeps the original error details.
        THROW;
    END CATCH

END;
GO

CREATE OR ALTER PROCEDURE SP_ScheduleDetails_GetByWishListIDAndScheduleNum
    @WishListID int,
    @ScheduleNum int
AS
BEGIN
    SET NOCOUNT ON
    
    DECLARE @ScheduleID INT;

    BEGIN TRY
        SELECT @ScheduleID = ScheduleID FROM GeneratedSchedules
        WHERE WishListID = @WishListID;

        SELECT ScheduleID, CourseID, CourseName, CourseCode, LectureID, LectureType, SectionNumber, OfferingID,
            SessionID, DayNum, StartTime, EndTime 
        FROM ScheduleDetails_view S
        WHERE S.ScheduleID = @ScheduleID AND S.ScheduleNum = @ScheduleNum;
    END TRY
    BEGIN CATCH
        -- CHANGED: THROW keeps the original error details.
        THROW;
    END CATCH

END;
GO