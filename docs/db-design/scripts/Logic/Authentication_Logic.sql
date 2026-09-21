USE UniPlan;
GO

DROP USER IF EXISTS usr_uniplan_executor;

USE master;
GO

IF EXISTS (SELECT * FROM sys.server_principals WHERE name = 'log_uniplan_executor')
BEGIN
    DROP LOGIN log_uniplan_executor;
END
GO

CREATE LOGIN log_uniplan_executor WITH PASSWORD = 'Password123';
GO

USE UniPlan;
GO

CREATE USER usr_uniplan_executor FOR LOGIN log_uniplan_executor;
GO

GRANT EXECUTE TO usr_uniplan_executor;
GO
