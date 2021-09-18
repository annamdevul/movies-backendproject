const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET movies API

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
      movie_name
    FROM 
       movie`;

  const getMoviesArray = await db.all(getMoviesQuery);
  response.send(getMoviesArray);
});

// POST movies API

app.post("/movies/", async (request, response) => {
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;

  const addMoviesQuery = `
    INSERT INTO 
        movie(director_id,movie_name,lead_actor)
    VALUES 
        ( ${directorId},
         '${movieName}',
         '${leadActor}');`;

  await db.run(addMoviesQuery);
  response.send("Movie Successfully Added");
});

// GET movie API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `
    SELECT 
       *
    FROM 
      movie
    WHERE 
       movie_id = ${movieId};`;

  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

// Update movie API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;

  const updateMovieQuery = `
      UPDATE 
          movie
       SET 
          director_id = ${directorId},
          movie_name = '${movieName}',
          lead_actor =  '${leadActor}'
        WHERE 
          movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
// DELETE movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
        DELETE FROM 
             movie
        WHERE 
             movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// GET directors API

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT 
           * 
        FROM 
            director`;

  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

// GET movie director API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getMovieDirectorQuery = `
    SELECT 
        movie_name
    FROM 
       movie
    WHERE 
       director_id = ${directorId};`;

  const moviesArray = await db.all(getMovieDirectorQuery);
  response.send(moviesArray);
});

module.exports = app;
