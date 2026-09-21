USE [UniPlan]
GO

update Courses
set NeededHours = 100
where CourseName = 'مشروع فصلي';


update Courses
set NeededHours = 125
where CourseName = 'مشروع تخرج';