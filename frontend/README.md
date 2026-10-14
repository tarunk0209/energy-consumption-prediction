# Frontend – Energy Consumption Prediction System

## About

This folder contains the frontend for the Energy Consumption Prediction System. I built the user interface using React and Vite.

The frontend connects to the FastAPI backend to manage production data and display energy predictions.

## Features

- Manage products, machine types, and shifts.
- Create and update production batches.
- Request an energy prediction for a production batch.
- View estimated energy consumption in kWh.
- View prediction history.

## Technologies Used

- React
- Vite
- JavaScript
- CSS
- Lucide React for icons

## Setup

Make sure Node.js and npm are installed.

Open a terminal inside the `frontend` folder and run:

```bash
npm install
npm run dev
```

Vite will display the local URL in the terminal. Open that URL in your browser.

## Build

To create a production build, run:

```bash
npm run build
```

## Backend Connection

The frontend communicates with the FastAPI backend. Start the backend before testing features that require database access or energy predictions.

The frontend API URL can be configured using the `VITE_API_URL` environment variable, if configured in the application.

## Note

For the complete project setup, model training instructions, and backend details, refer to the main `README.md` in the project root.