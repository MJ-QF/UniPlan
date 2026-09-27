USE [UniPlan];
GO



CREATE OR ALTER PROCEDURE SP_WishListItems_Insert
    @WishListID INT,
    @CourseID INT,
    @ItemID INT OUT
AS
BEGIN
    SET NOCOUNT ON;

    IF @WishListID <= 0
        OR @CourseID <= 0
    BEGIN
        ;THROW 51801, 'WishListItem validation failed', 1;
    END

    BEGIN TRY
        INSERT INTO dbo.WishListItems
        (
            WishListID,
            CourseID
        )
        VALUES
        (
            @WishListID,
            @CourseID
        );

        SET @ItemID = CONVERT(INT, SCOPE_IDENTITY());
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO


CREATE OR ALTER PROCEDURE SP_WishListItems_Delete
    @ItemID INT,
    @Result BIT OUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DELETE FROM dbo.WishListItems
        WHERE ItemID = @ItemID;

        SET @Result =
            CASE WHEN @@ROWCOUNT > 0
                 THEN 1
                 ELSE 0
            END;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO


CREATE OR ALTER VIEW VW_WishListItems
AS
SELECT
    WLI.ItemID,
    WLI.WishListID,
    WLI.CourseID,
    C.CourseName,
    C.CreditHours,
	C.CourseCode
	
FROM dbo.WishListItems WLI
INNER JOIN dbo.WishLists WL
    ON WLI.WishListID = WL.WishListID
INNER JOIN dbo.Courses C
    ON WLI.CourseID = C.CourseID;
GO


CREATE OR ALTER PROCEDURE SP_WishListItems_GetById
    @ItemID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT *
        FROM VW_WishListItems
        WHERE ItemID = @ItemID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO


CREATE OR ALTER PROCEDURE SP_WishListItems_GetByWishListId
    @WishListID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT *
        FROM VW_WishListItems
        WHERE WishListID = @WishListID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO


CREATE OR ALTER PROCEDURE SP_WishListItems_SyncCourses
    @CoursesIDs CourseIdListType READONLY,
    @ListId INT,
    @Result BIT OUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            DELETE FROM WishListItems 
            WHERE WishListID = @ListId;

            INSERT INTO WishListItems ([CourseID], [WishListID])
            SELECT CourseID , @ListId FROM @CoursesIDs;
        SET @Result = 1;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @Result = 0;

        THROW;
    END CATCH
END
GO