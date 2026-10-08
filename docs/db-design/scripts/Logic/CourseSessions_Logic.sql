USE [UniPlan];
GO


DROP PROCEDURE IF EXISTS SP_CourseSessions_GetByWishListID;
GO

DROP TYPE IF EXISTS DaysListType;
GO

CREATE TYPE DaysListType AS TABLE
(
    Day INT
)
GO

CREATE PROCEDURE SP_CourseSessions_GetByWishListID
    @Days DaysListType READONLY,
    @StartTime TIME,
    @EndTime TIME,
    @WishListId int
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[WishLists] WHERE WishListID = @WishListID)
        THROW 51703, '', 1;

    BEGIN TRY
        
        DECLARE @TermID INT;

        SELECT @TermID = TermID FROM WishLists W
        INNER JOIN StudentTerms ST ON ST.RegistrationID = W.RegistrationID
        WHERE W.WishListID = @WishListId;
        
        SELECT C.CourseID, C.CourseName, C.CourseCode, L.LectureID, L.LectureType, S.SectionNumber, S.OfferingID,
            S.SessionID, S.DayNum, S.StartTime, S.EndTime FROM WishListItems I
        JOIN Lectures L ON L.CourseID = I.CourseID
        JOIN Courses C ON C.CourseID = I.CourseID
        LEFT JOIN CourseSessions_view S ON S.LectureID = L.LectureID 
        AND DayNum IN (SELECT * FROM @Days) AND TermID = @TermID AND StartTime >= @StartTime AND EndTime <= @EndTime
        WHERE I.WishListID = @WishListId;

    END TRY
    BEGIN CATCH
        ROLLBACK;

        -- CHANGED: THROW keeps the original error details.
        THROW;
    END CATCH
END;
GO

/*=========================================================
INSERT
=========================================================*/
CREATE OR ALTER PROCEDURE SP_CourseSessions_Insert 
    @OfferingID INT, 
    @HallID INT, 
    @CreatedByAdminID INT = NULL, 
    @StartTime TIME, 
    @EndTime TIME,
    @DayNum INT,
    @SessionID INT OUT 
AS 
BEGIN 
    SET NOCOUNT ON; 

    IF @OfferingID <= 0 OR @HallID <= 0 
    BEGIN 
        ;THROW 51301, 'Course session validation failed.', 1; 
    END; 

    IF NOT EXISTS ( SELECT 1 FROM dbo.CourseOfferings WHERE OfferingID = @OfferingID ) 
    BEGIN 
        ;THROW 51203, 'Course Offering not found.', 1; 
    END; 

    IF NOT EXISTS ( SELECT 1 FROM dbo.Halls WHERE HallID = @HallID ) 
    BEGIN 
        ;THROW 50803, 'Hall not found.', 1; 
    END; 

	if Exists(select 1 from CourseSessions cs
	inner join SessionTimeSlots on cs.SessionID = SessionTimeSlots.SessionID
	inner join TimeSlots ts on SessionTimeSlots.SlotID = ts.SlotID 
	inner join Periods p on ts.PeriodID = p.PeriodID
	where HallID = @HallID And DayNum = @DayNum And 
	Exists(
	    select 1 from TimeSlots 
		inner join Periods on TimeSlots.PeriodID = Periods.PeriodID
		where Periods.StartTime < p.EndTime And Periods.StartTime > p.StartTime or
		      Periods.EndTime < p.EndTime And Periods.EndTime > P.StartTime or
			  Periods.StartTime <= p.StartTime And Periods.EndTime >= p.EndTime
	))
	Begin
        ;THROW 51302, 'This Session Already Took.', 1; 
	End

    BEGIN TRY 
        BEGIN TRANSACTION; 

        INSERT INTO dbo.CourseSessions ( OfferingID, HallID ) VALUES ( @OfferingID, @HallID ); 
        SET @SessionID = CONVERT(INT, SCOPE_IDENTITY()); 

        INSERT INTO dbo.SessionTimeSlots ([SessionID], [SlotID]) 
        SELECT @SessionID, T.SlotID 
        FROM TimeSlots T 
        INNER JOIN dbo.Periods P ON P.PeriodID = T.PeriodID 
        WHERE (P.StartTime = @StartTime OR P.EndTime = @EndTime)
        AND T.DayNum = @DayNum; 

        COMMIT TRANSACTION; 
    END TRY 
    BEGIN CATCH 
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION; 
        THROW; 
    END CATCH 
END; 
GO

CREATE OR ALTER PROCEDURE SP_CourseSessions_Update 
    @SessionID INT, 
    @OfferingID INT, 
    @HallID INT, 
    @StartTime TIME, 
    @EndTime TIME, 
    @DayNum INT,
    @Result BIT OUT 
AS 
BEGIN 
    SET NOCOUNT ON; 

    IF @SessionID <= 0 OR @OfferingID <= 0 OR @HallID <= 0 
    BEGIN 
        ;THROW 51301, 'Course session validation failed.', 1; 
    END; 

    IF NOT EXISTS ( SELECT 1 FROM dbo.CourseSessions WHERE SessionID = @SessionID ) 
    BEGIN 
        ;THROW 51303, 'Course Session not found.', 1; 
    END; 

    IF NOT EXISTS ( SELECT 1 FROM dbo.CourseOfferings WHERE OfferingID = @OfferingID ) 
    BEGIN 
        ;THROW 51203, 'Course Offering not found.', 1; 
    END; 

    IF NOT EXISTS ( SELECT 1 FROM dbo.Halls WHERE HallID = @HallID ) 
    BEGIN 
        ;THROW 50803, 'Hall not found.', 1; 
    END; 

    BEGIN TRY 
        BEGIN TRANSACTION;

            UPDATE dbo.CourseSessions 
            SET OfferingID = @OfferingID, HallID = @HallID 
            WHERE SessionID = @SessionID; 

            IF NOT EXISTS (
                SELECT 1 
                FROM dbo.SessionTimeSlots STS
                INNER JOIN dbo.TimeSlots T ON T.SlotID = STS.SlotID
                INNER JOIN dbo.Periods P ON P.PeriodID = T.PeriodID
                WHERE STS.SessionID = @SessionID AND T.DayNum = @DayNum
                HAVING MIN(P.StartTime) = @StartTime AND MAX(P.EndTime) = @EndTime
            )
            BEGIN
                DELETE FROM dbo.SessionTimeSlots 
                WHERE SessionID = @SessionID;

                INSERT INTO dbo.SessionTimeSlots ([SessionID], [SlotID]) 
                SELECT @SessionID, T.SlotID 
                FROM TimeSlots T 
                INNER JOIN dbo.Periods P ON P.PeriodID = T.PeriodID 
                WHERE (P.StartTime = @StartTime OR P.EndTime = @EndTime)
                AND T.DayNum = @DayNum;   
            END

            SET @Result = 1; 

        COMMIT TRANSACTION;
    END TRY 
    BEGIN CATCH 
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @Result = 0;
        THROW; 
    END CATCH 
END; 
GO


/*=========================================================
DELETE
=========================================================*/
CREATE OR ALTER PROCEDURE SP_CourseSessions_Delete
    @SessionID INT,
    @Result BIT OUT
AS
BEGIN
    SET NOCOUNT ON;

    IF @SessionID <= 0
    BEGIN
        ;THROW 51301, 'Course session validation failed.', 1;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.CourseSessions
        WHERE SessionID = @SessionID
    )
    BEGIN
        SET @Result = 0;
        RETURN;
    END;

    BEGIN TRY
        BEGIN TRANSACTION;
            DELETE FROM dbo.SessionTimeSlots 
            WHERE SessionID = @SessionID;

            DELETE FROM dbo.CourseSessions
            WHERE SessionID = @SessionID;

            SET @Result =
                CASE
                    WHEN @@ROWCOUNT > 0 THEN 1
                    ELSE 0
                END;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH

END;
GO

/*=========================================================
VIEWS
=========================================================*/
CREATE OR ALTER VIEW CourseSessions_view
AS
SELECT DISTINCT 
        Cs.SessionID,
		Cs.CreatedByAdminID As SCreatedByAdminID,
        CO.CourseCode,
		CO.CourseID,
		CO.CourseName,
		CO.CreatedByAdminID As CCreatedByAdminID,
		CO.CreditHours,
		CO.DurationValue,
		CO.LectureID,
		CO.OfferingID,
		CO.LectureType,
		CO.SectionNumber,
		CO.TermID,
		CO.TermType,
		CO.TermYear,
        TS.DayNum,
		H.Floor,
		H.HallID,
		H.HallName,
        H.Building,
		H.CreatedByAdminID As HCreatedByAdminID,
        StartTime = MIN(P.StartTime) OVER(PARTITION BY CS.SessionID),
        EndTime = MAX(P.EndTime) OVER(PARTITION BY CS.SessionID)
    FROM dbo.CourseSessions CS
    INNER JOIN dbo.CourseOfferings_view CO
        ON CS.OfferingID = CO.OfferingID
    INNER JOIN dbo.Halls H
        ON CS.HallID = H.HallID 
    INNER JOIN dbo.SessionTimeSlots ST
        ON ST.SessionID = CS.SessionID
    INNER JOIN dbo.TimeSlots TS
        ON TS.SlotID = ST.SlotID
    INNER JOIN dbo.Periods P
        ON P.PeriodID = TS.PeriodID
GO

/*=========================================================
GET ALL
=========================================================*/
CREATE OR ALTER PROCEDURE SP_CourseSessions_GetAll
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    IF @PageNumber < 1
        SET @PageNumber = 1;

    IF @PageSize < 1
        SET @PageSize = 10;

    BEGIN TRY

        SELECT * FROM CourseSessions_view
        ORDER BY SessionID
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

/*=========================================================
GET BY ID
=========================================================*/
CREATE OR ALTER PROCEDURE SP_CourseSessions_GetById
    @SessionID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT * FROM CourseSessions_view
        WHERE SessionID = @SessionID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO
