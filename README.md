# ScoreMore - Sports Scoring Application

ScoreMore is a web-based application for tracking scores in sports games. It allows users to create teams, add players, update scores, and view game history. The application uses `sql.js` to persist game data in the browser's `localStorage`.

## Features

*   **Team Management:** Create and name up to two teams.
*   **Player Management:** Add players to each team.
*   **Score Tracking:** Increment or decrement player scores.
*   **Game State:** Start, end, and manage halftime for games.
*   **Game Halves:** Tracks "First Half" and "Second Half" of a game.
*   **Scoring Log:** View a detailed log of scoring events and halftime changes, with timestamps.
*   **Game History:** View a history of completed games, including teams, scores, and winners.
*   **Data Persistence:** Game state, history, and logs are saved to `localStorage` and reloaded on subsequent visits.
*   **Date Formatting:** Dates are displayed in YYYY-MM-DD format, and timestamps include HH:MM:SS.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Database:** `sql.js` (for in-browser SQLite via WebAssembly)
*   **State Management:** React Hooks (`useState`, `useEffect`)

## Project Structure

```
/public
    sql-wasm.wasm       # sql.js WebAssembly file
/src
    /components         # React components for UI elements
        GameControls.tsx
        GameHistory.tsx
        Player.tsx
        ScoreBoard.tsx
        ScoringLog.tsx
        Team.tsx
    App.tsx             # Main application component, handles state and logic
    db.ts               # Database interaction logic using sql.js
    index.css           # Global styles (Tailwind base)
    index.tsx           # Entry point for the React application
vite.config.ts          # Vite configuration
tailwind.config.js      # Tailwind CSS configuration
postcss.config.js       # PostCSS configuration
tsconfig.json           # TypeScript configuration
package.json            # Project dependencies and scripts
README.md               # This file
```

## Getting Started

1.  **Install Dependencies:**
    Open your terminal in the project root directory and run:
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    After installation, start the Vite development server:
    ```bash
    npm run dev
    ```
    This will typically open the application in your default web browser at `http://localhost:5173` (or another port if 5173 is in use).

## Key Files and Logic

*   **`src/App.tsx`:**
    *   Manages the main application state (teams, game status, history, logs).
    *   Contains functions for game logic (starting/ending games, adding players, updating scores, toggling halftime).
    *   Uses `useEffect` hooks to load data from and save data to the database via `src/db.ts`.
    *   Handles date and time formatting for display.

*   **`src/db.ts`:**
    *   Initializes the `sql.js` database and loads the `sql-wasm.wasm` file.
    *   Defines the database schema (`current_game_state`, `game_history`, `score_log`).
    *   Provides functions to save and load game state, game history, and scoring logs.
    *   Persists the database to `localStorage` after changes.

*   **`public/sql-wasm.wasm`:**
    *   The WebAssembly binary for `sql.js`. This file must be present in the `public` directory to be served correctly by Vite and loaded by `sql.js`.

## Notes on Data Persistence

*   The application uses `sql.js` to create an in-memory SQLite database.
*   This database is then exported as a binary array and stored as a string in the browser's `localStorage`.
*   On application load, it attempts to retrieve this data from `localStorage` and reinitialize the database.
*   If `localStorage` data is corrupted or missing, a new empty database is created.
*   Schema changes (like renaming `current_inning` to `current_half`) might require clearing `localStorage` for the site if old data causes issues, as no automatic migration logic is currently implemented for schema updates.

## Available Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run lint`: Lints the codebase using ESLint.
*   `npm run preview`: Serves the production build locally for preview.

## Docker Support

This application can be built and run using Docker.

1.  **Build the Docker Image:**
    Open your terminal in the project root directory and run:
    ```powershell
    docker build -t scoremore-app .
    ```

2.  **Run the Docker Container:**
    After building the image, run the container:
    ```powershell
    docker run -p 8080:80 scoremore-app
    ```
    The application will be accessible at `http://localhost:8080` in your web browser.

**Dockerfile details:**
*   Uses a multi-stage build.
*   Stage 1: Builds the React application using `node:20-alpine`.
*   Stage 2: Serves the static build output from Stage 1 using `nginx:stable-alpine`.
*   An `nginx.conf` file is included to ensure proper serving of the single-page application (SPA) by routing all paths to `index.html`.
*   A `.dockerignore` file is used to minimize the build context sent to the Docker daemon.

## Running with Docker Compose

Alternatively, you can use Docker Compose to manage and run the application container. Create a `docker-compose.yml` file in the root of your project with the following content:

```yaml
version: '3.8'

services:
  scoremore-app:
    # IMPORTANT: Replace YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME with your actual GitHub username and repository name.
    image: ghcr.io/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME:latest
    ports:
      - "8080:80"  # Maps port 8080 on your host to port 80 in the container
    restart: unless-stopped
    container_name: scoremore_app_instance
```

**Instructions:**

1.  **Save the file:** Create the `docker-compose.yml` file as shown above in your project root.
2.  **Update the image name:** Modify the `image` line to point to your actual image in GHCR (e.g., `ghcr.io/yourusername/scoremore:latest`).
3.  **Run with Docker Compose:**
    Open your terminal in the project root directory and run:
    ```powershell
    docker-compose up -d
    ```
    The `-d` flag runs the container in detached mode (in the background).
4.  **Access the application:** The application will be accessible at `http://localhost:8080` in your web browser.

To stop the application, run:
```powershell
docker-compose down
```
