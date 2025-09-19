@'
# Donations App

A minimal full-stack demo to track donations.  
Built as part of a take-home coding assessment.

---

## Tech Stack

- **Backend:** .NET 9 Minimal API, EF Core 9, SQLite  
- **Frontend:** React (TypeScript + CRA)  
- **Integration:** Mock CRM client (swappable for Blackbaud / Dynamics)  

---

## Features

- Add a new donation with **Donor Name**, **Amount**, and **Date**  
- Store donations in a lightweight **SQLite database**  
- Retrieve all donations via API (`GET /donations`)  
- Mock CRM integration to simulate sending donations to external systems  
- React frontend with:  
  - A **form** to create donations  
  - A **table** showing all donations (sorted newest first)  

---

## Screenshots

> Place screenshots in a `docs/` folder at the repo root and update these links.

- **Backend (Swagger UI)**  
  ![Swagger UI](docs/swagger.png)

- **Frontend (Donation Form + Table)**  
  ![Frontend UI](docs/frontend.png)

---

## Getting Started

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/)  
- [Node.js 18+](https://nodejs.org/) and npm  

---

### Backend Setup

```bash
# from project root
cd backend/DonationsAPI

# apply EF Core migrations (creates donations.db)
dotnet ef database update

# run the API
dotnet run



API will be available at:

Swagger UI → http://localhost:5125/swagger

Health check → http://localhost:5125/health

Endpoints:

GET /donations → list all donations

POST /donations → create new donation


{
  "donorName": "Jane Doe",
  "amount": 50.25,
  "date": "2025-09-19T14:30:00Z"
}


# from project root
cd frontend
npm install
npm start

Frontend will run at → http://localhost:3000

Proxy is configured to forward API calls to → http://localhost:5125

Design Choices

Minimal API: concise structure, avoids controller boilerplate.

EF Core + SQLite: simple, lightweight DB for local development.

Integration Layer: ICrmClient interface → easily swap out the mock with real CRM (Blackbaud / Dynamics).

Swagger: integrated API documentation for easy exploration.

React + TypeScript: strongly typed frontend with form + table UI.


donations-app/
│
├── backend/
│   └── DonationsAPI/      # .NET 9 Minimal API
│
├── frontend/              # React (CRA + TypeScript) UI
│
├── docs/                  # screenshots go here (swagger.png, frontend.png)
│
├── .gitignore
└── README.md
