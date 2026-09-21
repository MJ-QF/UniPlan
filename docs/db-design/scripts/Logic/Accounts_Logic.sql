USE [UniPlan];
GO

CREATE OR ALTER PROCEDURE SP_Accounts_Validate
    @AccountName nvarchar(50),
    @Email nvarchar(255),
    @AccountID int = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NULLIF(LTRIM(RTRIM(@AccountName)), N'') IS NULL
        RETURN 50401;

    IF NULLIF(LTRIM(RTRIM(@Email)), N'') IS NULL
        RETURN 50401;

    IF @Email NOT LIKE '%_@_%._%'
        RETURN 50401;

    IF EXISTS (
        SELECT 1
        FROM [dbo].[Accounts]
        WHERE AccountName = @AccountName
          AND (@AccountID IS NULL OR AccountID != @AccountID)
    )
        RETURN 50402;

    IF EXISTS (
        SELECT 1
        FROM [dbo].[Accounts]
        WHERE Email = @Email
          AND (@AccountID IS NULL OR AccountID != @AccountID)
    )
        RETURN 50402;

    IF @AccountID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[Accounts] WHERE AccountID = @AccountID)
        RETURN 50403;

    RETURN 0;
END;
GO

CREATE OR ALTER PROCEDURE SP_Accounts_Insert
    @AccountName nvarchar(50),
    @Password nvarchar(255),
    @Email nvarchar(255),
    @AccountID int OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrCode int;
    EXEC @ErrCode = SP_Accounts_Validate @AccountName, @Email, NULL;

    IF @ErrCode != 0
        THROW @ErrCode, '', 1;

    BEGIN TRY
        INSERT INTO [dbo].[Accounts] ([AccountName], [Password], [Email])
        VALUES (@AccountName, @Password, @Email);

        SET @AccountID = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE SP_Accounts_Update
    @AccountID int,
    @AccountName nvarchar(50),
    @Email nvarchar(255),
    @Result bit OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SET @Result = 0;

    DECLARE @ErrCode int;
    EXEC @ErrCode = SP_Accounts_Validate @AccountName, @Email, @AccountID;

    IF @ErrCode != 0
        THROW @ErrCode, '', 1;

    BEGIN TRY
        UPDATE [dbo].[Accounts]
        SET [AccountName] = @AccountName,
            [Email] = @Email
        WHERE AccountID = @AccountID;

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

CREATE OR ALTER PROCEDURE SP_Accounts_Delete
    @AccountID int,
    @Result bit OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SET @Result = 0;

    IF NOT EXISTS (SELECT 1 FROM [dbo].[Accounts] WHERE AccountID = @AccountID)
        THROW 50403, '', 1;

    IF EXISTS (SELECT 1 FROM [dbo].[Administrators] WHERE AccountID = @AccountID)
        THROW 50404, '', 1;

    IF EXISTS (SELECT 1 FROM [dbo].[Students] WHERE AccountID = @AccountID)
        THROW 50404, '', 1;

    BEGIN TRY
        DELETE FROM [dbo].[Accounts]
        WHERE AccountID = @AccountID;

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

CREATE OR ALTER PROCEDURE SP_Accounts_UpdatePassword
    @AccountID int,
    @NewPassword nvarchar(255),
    @Result bit OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        UPDATE Accounts
        SET [Password] = @NewPassword
        WHERE [AccountID] = @AccountID;

        IF @@ROWCOUNT > 0
        BEGIN
            SET @Result = 1;
        END
        ELSE
        BEGIN
            SET @Result = 0;
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE SP_Accounts_GetById
    @AccountID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        SELECT A.* ,   
        CASE 
            WHEN EXISTS(SELECT 1 FROM Students S WHERE S.AccountID = A.AccountID) THEN 'Student'
            ELSE 'Admin'
        END AS Role
        FROM Accounts A
        WHERE A.AccountID = @AccountID;

    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE SP_Accounts_GetByName
    @AccountName nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        SELECT A.* , 
        CASE 
            WHEN EXISTS(SELECT 1 FROM Students S WHERE S.AccountID = A.AccountID) THEN 'Student'
            ELSE 'Admin'
        END AS Role
        FROM Accounts A
        WHERE A.AccountName = @AccountName;

    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO