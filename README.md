# JobTrack — Full-Stack Job Application Tracking System

## Week 4 – Front-End and Back-End Integration

JobTrack is a web application that helps students, fresh graduates, and job seekers manage job and internship applications in one place. Week 4 connects the existing front-end interface with a Node.js and Express.js REST API.

## Features
- Dashboard with live application statistics
- Application pipeline and recent applications
- Search and status filtering
- Add application through POST API
- View application details
- Edit application through PUT API
- Delete application through DELETE API
- JSON-based persistent data storage
- Input validation and API error handling
- Responsive interface

## API Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/applications` | Get all applications |
| GET | `/api/applications/:id` | Get one application |
| POST | `/api/applications` | Create an application |
| PUT | `/api/applications/:id` | Update an application |
| DELETE | `/api/applications/:id` | Delete an application |
| GET | `/api/health` | Check API status |

## Technologies
- HTML5
- CSS3
- JavaScript (ES6+)
- Node.js
- Express.js
- RESTful APIs
- JSON data storage
- Git & GitHub

## How to Run
1. Install Node.js.
2. Open the project folder in VS Code or terminal.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000` in a browser.

## Project Structure
```text
JobTrackProject/
├── index.html
├── style.css
├── script.js
├── server.js
├── package.json
├── .gitignore
├── data/
│   └── applications.json
└── README.md
```

## Data Flow
User action → Front-end JavaScript → REST API → JSON data file → API response → Updated UI.

## Week 4 Outcome
The project demonstrates front-end/back-end integration, asynchronous API communication, CRUD operations, validation, error handling, and full-stack application data flow.
