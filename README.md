# LOST

LOST is a browser-based survival game about crash survivors stranded on an island.

The game is structured in three phases:

1. Survive and build the camp
2. Explore the island and rescue hidden survivors
3. Build the raft and sail to safety

## Tech Stack

- Static HTML, CSS, and JavaScript
- No backend required
- Designed to run locally or in a simple Docker container behind a web server

## Project Structure

- `index.html` - application entry point
- `resources/data/` - game data such as people, discoveries, and events
- `resources/js/` - game logic and data loading
- `resources/styles/` - stylesheets
- `resources/text/` - council scenes, expedition text, and article text
- `resources/ui/` - shared UI and status images
- `resources/map/` - exploration map tiles
- `resources/raft/` - raft and ending images
- `resources/survivors/` - survivor portraits
- `docker/` - runtime config for container deployment

## Local Run

Serve the repository with a local web server and open `index.html`.

Because the game loads JSON and markdown files with `fetch`, it should not be opened directly from the filesystem.

## Docker

Build and run:

```bash
docker build -t lost-game .
docker run --rm -p 8080:80 lost-game
```

Then open:

```text
http://localhost:8080
```

## Save System

The current save system uses browser `localStorage`.

That means saves are tied to the browser/device unless a backend is added later.
