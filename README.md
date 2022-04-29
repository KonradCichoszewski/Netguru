# Node.js recruitment task

This application consists of two simple services. The first one, `auth-service`
was provided by Netguru as a starting point of this task.

The other one, `movies-service` provides two endpoints:

1. `POST /movies`

   1. Allows creating a movie object based on movie title passed in the request
      body, under the "title" key
   2. Based on the title additional movie details are fetched from
      https://omdbapi.com/ and saved to the database. Data which gets fetched
      from OMDb API:

   ```
     Title: string
     Released: date
     Genre: string
     Director: string
   ```

   3. In case any of the values is missing, it is ignored while saving
      the record to the database.
   4. Only authorized users can create a movie.
   5. `Basic` users are restricted to create 5 movies per month (calendar month).
      This value can be changed in appropriate envfile as descirbed below.
      `Premium` users have no limits.

2. `GET /movies`
   1. Fetches a list of all movies ever created by an authorized user.

Additionally, there's another service defined in docker-compose file with
a mongo database.

## Prerequisites

You need to have `docker` and `docker-compose` installed on your computer to run
the application

## Run locally

1. Clone this repository
2. In the root directory, there is an `env` directory. There are three envfiles
   inside, each reposnsible for `auth-service`, `movies-service` and `mongodb`
   service accordingly.
3. _Optionally_, you can change dummy values in the envfiles to your own custom
   ones. While changing any value, take into account any instructions which may
   be attached in the comments above particular variables.
4. _Optionally, although strongly advised_, change `OMDB_API_KEY` variable
   in `movies.env` file to your own custom one, obtained from
   https://www.omdbapi.com/. Since this is a public repository, entries from the
   provided key may be already exhausted and thus prevent the application from
   working properly.
5. _Optionally_, you can change `MOVIES_PER_MONTH_BASIC` variable value in the
   `movies.env` file. It changes the amount of movies basic user can save monthly.
   By default, this value is set to 5.
6. Run from root dir

```
docker-compose up -d
```

By default, the auth service will start on port `3000` but you can override
the default value by setting the `APP_PORT` env var.

By default, the movies service will start on port `5000` but you can override
the default value by setting the `MOVIES_PORT` env var.

```
APP_PORT=8081 MOVIES_PORT=5051 docker-compose up -d
```

To stop the whole application at once run

```
docker-compose down
```

To run the tests, run

```
MOVIES_MODE=test docker-compose up --build
```

To run the application in development mode, uncomment appropriate lines of code
in the `docker-compose.yml` file. After that, run

```
MOVIES_MODE=dev docker-compose up --build
```

Line added for making test branch different
