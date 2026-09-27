using Business.Interfaces;
using Business.Services;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using DataAccess;
using DataAccess.Repositories;
using Infrastructure.ExternalServices;
using Infrastructure.ExternalServices.Validation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:5173") // روابط الفرونت (مثل React أو Vue)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<DBHelpers>();

//  External Services 
builder.Services.AddScoped<ILogService, LogService>();
builder.Services.AddScoped<IExceptionService, ExceptionService>();
builder.Services.AddScoped<IValidationService, ValidationService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

// Repositories
builder.Services.AddScoped<IPeopleRepository, PeopleRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IHallRepository, HallRepository>();
builder.Services.AddScoped<IMajorRepository, MajorRepository>();
builder.Services.AddScoped<IPeriodRepository, PeriodRepository>();
builder.Services.AddScoped<ITimeSlotRepository, TimeSlotRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<ILectureRepository, LectureRepository>();
builder.Services.AddScoped<IAcademicTermRepository, AcademicTermRepository>();
builder.Services.AddScoped<ICourseOfferingRepository, CourseOfferingRepository>();
builder.Services.AddScoped<ICourseRepository, CoursesRepository>();
builder.Services.AddScoped<ICoursePrequsetRepository, CoursePrequstRepository>();
builder.Services.AddScoped<ICourseSessionRepository, CourseSessionRepository>();
builder.Services.AddScoped<IStudentTermRepository, StudentTermRepository>();
builder.Services.AddScoped<IStudentCourseRepository, StudentCourseRepository>();
builder.Services.AddScoped<IWishListItemRepository, WishListItemRepository>();
builder.Services.AddScoped<IWishListRepository, WishListRepository>();
builder.Services.AddScoped<IGeneratedScheduleRepository, GeneratedScheduleRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();

// Services
builder.Services.AddScoped<IPeriodService, PeriodsService>();
builder.Services.AddScoped<IPeopleService, PeopleService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IMajorService, MajorService>();
builder.Services.AddScoped<IHallService, HallService>();
builder.Services.AddScoped<IAdministratorService, AdministratorService>();
builder.Services.AddScoped<ITimeSlotsService, TimeSlotsService>();
builder.Services.AddScoped<ILectureService, LectureService>();
builder.Services.AddScoped<IAcademicTermService, AcademicTermService>();
builder.Services.AddScoped<ICourseOfferingService, CourseOfferingService>();
builder.Services.AddScoped<ICoursesService, CoursesService>();
builder.Services.AddScoped<ICoursePrequistService, CoursePrequistService>();
builder.Services.AddScoped<ICourseSessionService, CourseSessionService>();
builder.Services.AddScoped<IStudentCourseService, StudentCourseService>();
builder.Services.AddScoped<IStudentTermService, StudentTermService>();
builder.Services.AddScoped<IWishListItemService, WishListItemService>();
builder.Services.AddScoped<IWishListService, WishListService>();
builder.Services.AddScoped<IGeneratedScheduleService, GeneratedScheduleService>();
builder.Services.AddScoped<IAccountService, AccountService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// تفعيل سياسة الـ CORS هنا قبل الـ Authorization
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();