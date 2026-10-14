USE [UniPlan];
GO

CREATE OR ALTER FUNCTION ValidatPerson
(
    @FirstName nvarchar(255),
    @MiddleName nvarchar(255),
    @LastName nvarchar(255)
)
RETURNS bit
AS
BEGIN
    -- CHANGED: Empty strings are now invalid, not only NULL values.
    IF NULLIF(LTRIM(RTRIM(@FirstName)), '') IS NULL
        OR NULLIF(LTRIM(RTRIM(@LastName)), '') IS NULL


    BEGIN
        RETURN 0;
    END

    RETURN 1;
END;
GO


CREATE OR ALTER FUNCTION Validat_New_AccountInfo
(
    @AccountName nvarchar(50),
    @Password nvarchar(255),
    @Email nvarchar(255)
)
RETURNS bit
AS
BEGIN
    -- CHANGED: Empty strings are now invalid, not only NULL values.
    IF (NULLIF(LTRIM(RTRIM(@AccountName)), '') IS NULL)
        OR (NULLIF(LTRIM(RTRIM(@Email)), '') IS NULL)
        OR (NULLIF(LTRIM(RTRIM(@Password)), '') IS NULL)
    BEGIN
        RETURN 0;
    END

    RETURN 1;
END;
GO


CREATE OR ALTER FUNCTION ValidatAccountInfo
(
    @AccountName nvarchar(50),
    @Email nvarchar(255)
)
RETURNS bit
AS
BEGIN

    -- CHANGED: Empty strings are now invalid, not only NULL values.
    IF NULLIF(LTRIM(RTRIM(@AccountName)), '') IS NULL
        OR NULLIF(LTRIM(RTRIM(@Email)), '') IS NULL
    BEGIN
        RETURN 0;
    END

    RETURN 1;
END;
GO


CREATE OR ALTER FUNCTION ValidatAdministratorInfo
(
    @PersonID int
)
RETURNS bit
AS
BEGIN
    IF @PersonID IS NULL OR @PersonID <= 0
    BEGIN
        RETURN 0;
    END

    IF NOT EXISTS
    (
        SELECT 1
        FROM People
        WHERE PersonID = @PersonID
    )
    BEGIN
        RETURN 0;
    END

    RETURN 1;
END;
GO


CREATE OR ALTER PROCEDURE SP_AdminProfile_Insert
    @IsActive bit,
    @PersonID int,
    @AdministratorID int OUT,

    @AccountName nvarchar(50),
    @Password nvarchar(255),
    @Email nvarchar(255),
    @AccountID int OUT ,

	@Result bit out
AS
BEGIN
    SET NOCOUNT ON;

    IF @IsActive IS NULL
        SET @IsActive = 1;

    -- CHANGED: THROW stops the procedure immediately.
    -- RAISERROR in your original code raised the error but the procedure could continue.
    IF dbo.Validat_New_AccountInfo(@AccountName, @Password, @Email) = 0
        THROW 50401, 'Account validation failed', 1;

    IF EXISTS
    (
        SELECT 1
        FROM Accounts
        WHERE Email = @Email
           OR AccountName = @AccountName
    )
    BEGIN
        ;THROW 50402, 'Account Name Or Email Already Exists', 1;
    END

    -- CHANGED: THROW stops execution immediately.
    IF dbo.ValidatAdministratorInfo(@PersonID) = 0
        THROW 50201, 'Administrator validation failed', 1;


    -- CHANGED: Prevent creating two admin profiles for the same person.
    IF EXISTS
    (
        SELECT 1
        FROM Administrators
        WHERE PersonID = @PersonID
    )
        THROW 50202, 'This person already has an administrator profile', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO Accounts(AccountName, Password, Email)
        VALUES (@AccountName, @Password, @Email);

        -- CHANGED: Explicitly converts SCOPE_IDENTITY() to int.
        SET @AccountID = CONVERT(int, SCOPE_IDENTITY());

        INSERT INTO Administrators(IsActive, PersonID, AccountID)
        VALUES (@IsActive, @PersonID, @AccountID);

        -- CHANGED: Explicitly converts SCOPE_IDENTITY() to int.
        SET @AdministratorID = CONVERT(int, SCOPE_IDENTITY());

		select 1;

        COMMIT TRANSACTION;

		set @Result = 1;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
		set @Result = 0;
        -- CHANGED: THROW keeps the original error details.
        THROW;
    END CATCH
END;
GO


CREATE OR ALTER PROCEDURE SP_AdminProfile_Update
    @IsActive bit,
    @AdministratorID int,

    @AccountName nvarchar(50),
    @Email nvarchar(255),
    

    @FirstName nvarchar(255),
    @MiddleName nvarchar(255),
    @LastName nvarchar(255) ,


	@Result bit out
AS
BEGIN
    SET NOCOUNT ON;

	
    if(NULLIF(LTRIM(RTRIM(@MiddleName)), '') is null)
	  set @MiddleName = null;
	
     Declare @PersonID int;
	 select @PersonID = Administrators.PersonID from Administrators where AdminID = @AdministratorID;

	 Declare @AccountID int;
	 select @AccountID = Administrators.AccountID from Administrators where AdminID = @AdministratorID;


    IF @IsActive IS NULL
        SET @IsActive = 1;

    -- CHANGED: Removed @OldEmail logic.
    -- The validation function now receives @AccountID instead.

    -- CHANGED: Uses @AccountID to detect duplicate email/account name correctly.
    IF dbo.ValidatAccountInfo(@AccountName, @Email) = 0
        THROW 50401, 'Account validation failed', 1;

	
    -- CHANGED: Duplicate check now excludes the current account by AccountID.
    -- This is safer than comparing @Email with @OldEmail.
    IF EXISTS
    (
        SELECT 1
        FROM Accounts
        WHERE AccountID <> @AccountID
          AND (Email = @Email OR AccountName = @AccountName)
    )
    BEGIN
         ;THROW 50402, 'Account validation failed', 1;
    END

    -- CHANGED: THROW stops execution immediately.
    IF dbo.ValidatAdministratorInfo(@PersonID) = 0
        THROW 50201, 'Administrator validation failed', 1;

    -- CHANGED: THROW stops execution immediately.
    IF dbo.ValidatPerson(@FirstName, @MiddleName, @LastName) = 0
        THROW 50101, 'Person validation failed', 1;

    -- CHANGED: Make sure these three IDs belong to the same admin profile.
    IF NOT EXISTS
    (
        SELECT 1
        FROM Administrators
        WHERE AdminID = @AdministratorID
          AND AccountID = @AccountID
          AND PersonID = @PersonID
    )
        THROW 50203, 'Profile Dose not Exist', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE Accounts
        SET AccountName = @AccountName,
            Email = @Email
        WHERE AccountID = @AccountID;

		 IF @@ROWCOUNT > 0
        BEGIN
            SET @Result = 1;
        END
        ELSE
        BEGIN
            SET @Result = 0;
        END

        UPDATE Administrators
        SET IsActive = @IsActive,
            PersonID = @PersonID,
            AccountID = @AccountID
        WHERE AdminID = @AdministratorID;

		 IF @@ROWCOUNT > 0
        BEGIN
            SET @Result = 1;
        END


        UPDATE People
        SET FirstName = @FirstName,
            MiddleName = @MiddleName,
            LastName = @LastName
        WHERE PersonID = @PersonID;

		IF @@ROWCOUNT > 0
        BEGIN
            SET @Result = 1;
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- CHANGED: THROW keeps the original error details.
        THROW;
    END CATCH
END;
GO



--NO Need To Delete Person Or Account cuz Admin Still Exist but not Active anyMores
CREATE OR ALTER PROCEDURE SP_AdminProfile_Delete

    @AdministratorID int ,
	@Result bit out
AS
BEGIN
    SET NOCOUNT ON;


    BEGIN TRY

        DELETE FROM Administrators
        WHERE AdminID = @AdministratorID;

				 IF @@ROWCOUNT > 0
        BEGIN
            SET @Result = 1;
        END
		else 
		begin
		   set @Result = 0;
		end

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- CHANGED: THROW keeps the original error details.
        THROW;
    END CATCH
END;
GO


CREATE OR ALTER VIEW AdminProfiles_view
AS
SELECT
    Administrators.AdminID,
    Accounts.AccountID,
    People.PersonID,
    Accounts.AccountName,
    Accounts.Email,
    People.FirstName,
    People.MiddleName,
    People.LastName
FROM People
INNER JOIN Administrators
    ON People.PersonID = Administrators.PersonID
INNER JOIN Accounts
    ON Administrators.AccountID = Accounts.AccountID
	where IsActive = 1;
GO


CREATE OR ALTER PROCEDURE SP_AdminProfile_GetAll
    @PageNumber int = 1,
    @PageSize int = 10
AS
BEGIN
    SET NOCOUNT ON;

    -- CHANGED: Prevent invalid pagination values.
    IF @PageNumber IS NULL OR @PageNumber < 1
        SET @PageNumber = 1;

    -- CHANGED: Prevent invalid page size.
    IF @PageSize IS NULL OR @PageSize < 1
        SET @PageSize = 10;

    SELECT *
    FROM AdminProfiles_view
    ORDER BY AdminID
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO


CREATE OR ALTER PROCEDURE SP_AdminProfile_GetById
    @AdminID int
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM AdminProfiles_view
    WHERE AdminID = @AdminID;
END;
GO

CREATE OR ALTER PROCEDURE SP_AdminProfile_GetByAccountId
    @AccountID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM AdminProfiles_view
    WHERE AccountID = @AccountID;
END;
GO


Create or Alter Trigger TR_NonActive_Admin
on Administrators
instead of Delete
As
Begin 

    Declare @AdminID int;

    select @AdminID = deleted.AdminID from deleted;

    Update Administrators
    set IsActive = 0
    where AdminID = @AdminID;

End

go

