# UniPlan

**UniPlan** is a comprehensive scheduling and academic planning solution designed to help university students optimize their semester schedules and make informed decisions about course enrollment. By leveraging data, UniPlan not only assists students in building the best possible schedule but also provides valuable insights to university administration regarding student demand for specific subjects.

---

## 🚀 Features

* **Smart Scheduling**: Effortlessly build the optimal weekly schedule to balance academic requirements and personal preferences.
* **Course Guidance**: Get recommendations on which subjects to enroll in based on your academic progress and requirements.
* **Data-Driven Insights**: Helps university administrators monitor enrollment demand, ensuring they can allocate the appropriate number of seats for every subject.

---

## 🛠 Tech Stack

* **Backend**: C#, .NET, ADO.NET, ASP.NET REST APIs
* **Database**: SQL Server
* **Client (Admin)**: .NET Desktop Application
* **Client (Student)**: React (currently in development)

---

## 📁 Project Structure

```
UniPlan/
├── .github/                  # GitHub configuration
├── assets/                   # Images and other static assets
├── docs/
│   ├── db-design/
│   │   ├── diagrams/         # Database diagrams (ERD, etc.)
│   │   └── scripts/
│   │       ├── Full_DB.sql   # ⭐ Complete database script (run this first)
│   │       ├── Data/         # Data scripts
│   │       ├── Logic/        # Database logic scripts
│   │       └── Tests/        # Database test scripts
│   └── ui-designs/           # UI designs
├── src/
│   ├── Client/
│   │   ├── Desktop/          # Admin client (.NET Desktop Application)
│   │   └── Web/              # Student client (React, in development)
│   └── Server/
│       ├── API/              # ASP.NET REST API (startup project)
│       │   ├── Controllers/
│       │   ├── Extensions/
│       │   ├── Middlewares/
│       │   ├── Program.cs
│       │   ├── appsettings.json
│       │   └── appsettings.Development.json
│       ├── Business/         # Business logic layer
│       │   ├── DTOs/
│       │   ├── Interfaces/
│       │   ├── Mapper/
│       │   └── Services/
│       ├── Core/             # Domain layer
│       │   ├── Entities/
│       │   ├── Enums/
│       │   ├── Exceptions/
│       │   ├── Extensions/
│       │   ├── Interfaces/
│       │   └── Services/
│       ├── DataAccess/       # Data access layer (ADO.NET)
│       │   ├── Extensions/
│       │   ├── Mapping/
│       │   ├── Repositories/
│       │   └── DBHelpers.cs
│       └── Infrastructure/   # External integrations
│           └── ExternalServices/
├── .editorconfig
├── .gitignore
├── README.md
└── UniPlan.sln
```

The server follows a layered architecture: **API → Business → Core ← DataAccess**, with **Infrastructure** for external services.

---

## 📋 Prerequisites

* [Visual Studio](https://visualstudio.microsoft.com/) (2022 or newer) with the **ASP.NET and web development** and **.NET desktop development** workloads
* [.NET SDK](https://dotnet.microsoft.com/download) (the version targeted by the projects' `.csproj` files)
* [SQL Server](https://www.microsoft.com/sql-server) (Express, Developer, or any edition) and [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms) or Azure Data Studio
* [Node.js](https://nodejs.org/) — only needed for the React student client

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/QF-MJ/UniPlan.git
cd UniPlan
```

### 2. Set up the database

The database must be created **before** running the server.

1. Open **SSMS** (or Azure Data Studio) and connect to your SQL Server instance.
2. Open the script at:
   ```
   docs/db-design/scripts/Full_DB.sql
   ```
3. Execute the whole script (**F5**). It builds the complete database, so you don't need to run the scripts inside the `Data`, `Logic`, or `Tests` folders manually.

### 3. Configure the connection string

Open `src/Server/API/appsettings.json` (or `appsettings.Development.json` for local development) and update the database connection string so it points to your SQL Server instance and the database created in step 2.

Example:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=YOUR_DATABASE_NAME;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

> Keep the key name that already exists in the file; only change its value.

### 4. Run the server

**Using Visual Studio:**

1. Open `UniPlan.sln`.
2. Set **API** (`src/Server/API`) as the startup project.
3. Build and run (**F5**).

**Using the command line:**

```bash
dotnet run --project src/Server/API
```

### 5. Run the clients (optional)

* **Admin (Desktop)**: located in `src/Client/Desktop`. Set it as the startup project in Visual Studio (make sure the API is running).
* **Student (Web)**: located in `src/Client/Web`. The React client is currently in development.

---

## 🤝 Contributing

We welcome contributions! Whether you are interested in developing the React client or improving the .NET backend, please feel free to fork this repository and submit a Pull Request.

* **Report Issues**: Use the "Issues" tab to report bugs or request features.
* **Pull Requests**: Please ensure your code follows the existing project style (see `.editorconfig`) and includes relevant documentation.

---

## 📄 License

This project is licensed under the **MIT License**. See the [MIT License](https://choosealicense.com/licenses/mit/) for details.
