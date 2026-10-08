USE [UniPlan];
GO

CREATE OR ALTER PROCEDURE SP_WishLists_Validate
    @RegistrationID int,
    @WishListID int = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[StudentTerms] WHERE RegistrationID = @RegistrationID)
        RETURN 51603;

    IF @WishListID IS NOT NULL
        IF NOT EXISTS (SELECT 1 FROM [dbo].[WishLists] WHERE WishListID = @WishListID)
            RETURN 51703;
    RETURN 0;
END
GO

CREATE OR ALTER PROCEDURE SP_WishLists_Insert 
    @TermID int, 
    @StudentID int, 
    @CoursesIDs CourseIdListType READONLY, 
    @WishListID int OUTPUT 
AS 
BEGIN 
    SET NOCOUNT ON; 
    
    BEGIN TRANSACTION;

    BEGIN TRY 
        DECLARE @RegistrationID INT = ( 
            SELECT RegistrationID 
            FROM [dbo].[StudentTerms] 
            WHERE TermID = @TermID AND StudentID = @StudentID
        ); 
        
        IF @RegistrationID IS NULL 
        BEGIN 
            EXECUTE [dbo].[SP_StudentTerms_Insert] 
                @StudentID,
                @TermID,
                @RegistrationID OUTPUT;
        END; 
        
        DECLARE @ErrCode int; 
        EXEC @ErrCode = SP_WishLists_Validate @RegistrationID, NULL; 
        
        IF @ErrCode != 0 
            THROW @ErrCode, '', 1; 
            
        INSERT INTO [dbo].[WishLists] ([RegistrationID]) 
        VALUES (@RegistrationID); 
        
        SET @WishListID = SCOPE_IDENTITY(); 
        
        INSERT INTO [dbo].WishListItems ([CourseID], [WishListID]) 
        SELECT CourseID, @WishListID 
        FROM @CoursesIDs; 

        COMMIT TRANSACTION;

    END TRY 
    BEGIN CATCH 
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        THROW; 
    END CATCH 
END; 
GO

CREATE OR ALTER PROCEDURE SP_WishLists_Delete
    @WishListID int,
    @Result bit OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @Result = 0;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[WishLists] WHERE WishListID = @WishListID)
        THROW 51703, '', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM [dbo].[WishListItems]
        WHERE WishListID = @WishListID;

        DELETE FROM [dbo].[ScheduleDetails]
        WHERE ScheduleID IN (SELECT ScheduleID FROM [dbo].[GeneratedSchedules] WHERE WishListID = @WishListID);

        DELETE FROM [dbo].[GeneratedSchedules]
        WHERE WishListID = @WishListID;

        DELETE FROM [dbo].[WishLists]
        WHERE WishListID = @WishListID;

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

CREATE OR ALTER VIEW WishLists_view
AS
SELECT W.WishListID, ST.RegistrationID, ST.StudentID,
       A.* , 
       CASE
            WHEN 
            EXISTS (
                SELECT 1 FROM GeneratedSchedules 
                WHERE WishListID = W.WishListID
            ) THEN 0
            ELSE 1
       END AS AllowUpdate
FROM WishLists W
JOIN StudentTerms ST ON ST.RegistrationID = W.RegistrationID
JOIN AcademicTerms A ON A.TermID = ST.TermID;
GO

CREATE OR ALTER PROCEDURE SP_WishLists_GetByStudentID
    @StudentID int,
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

        SELECT * FROM WishLists_view W
        INNER JOIN StudentTerms ST ON W.RegistrationID = ST.RegistrationID
        WHERE ST.StudentID = @StudentID
        ORDER BY W.WishListID DESC 
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;

    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE SP_WishLists_GetById
    @WishListID int
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT * FROM WishLists_view
        WHERE WishListID = @WishListID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO