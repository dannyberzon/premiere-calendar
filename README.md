# Premiere Calendar

This is a simple HTML / CSS / Javascript web app that retrieves movie data from the api at [The Movie DB](http://themoviedb.org) and displays it in an interactive calendar.

A demo of the application is below.

http://premiere.berzon.io/

## Technologies
The following javascript libraries are used:

- [jQuery](https://jquery.com/) For dom manipulation and routing

- [Handlebars](http://handlebarsjs.com/) For templating

- [Moment](https://momentjs.com/) For date manipulation and formatting

- [Spin.js](http://spin.js.org/) For a simple loading spinner

- [Google Fonts](https://fonts.google.com/) For the Lato font

The rest is hand-written HTML CSS and Javacript.

## Known Issues

The API at The Movie DB only allows one page of results per request, which is a maximum of 20 movies.

As I am retrieving movies for a month or week between a start and end date, there is no guarantee that I will
recieve movies with a release date on every day of the relevant week. This means that on some months in the Calendar month view, and some
days in the week view, there are no movie posters displayed when there are actually movies on that day. The only real solution would require changes to the API, or
alternatively calling the API for each individual day. I have mitigated somewhat by retrieving multiple pages from the API, but the problem still exists for some months.

## Next steps

With more time to develop the app, I would implement the following as next steps:

- A movie details view, utilizing the api call to "/movies/id"
- Dealing with API timeout errors
- Adding in a front end workflow, such as NPM, Grunt or Gulp to allow for use of Sass and minified js
- Precompiling the handlebars templates