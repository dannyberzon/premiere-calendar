"use strict";
// Singleton function for connection to The Movie Database
// Using the IIFE pattern
var theMovieDB = function(){

  // Some constants for connection to the api
  var API_URL = "https://api.themoviedB.org/3";
  var DISCOVER_PATH = "/discover/movie";
  var API_KEY = "d71b25c6aac38815f7f7ef1459f7020f";

  // Method to query to API over ajax
  // takes the path to query, any data parameters, and a function to call on success
  var queryAPI = function(path, params, callback){
    params = params || {};
    // add api key to incoming params
    params['api_key'] = API_KEY;
    var url = API_URL + path;
    
    $.get(url, params, function(result){
      callback(result);
    });
  };

  return {
    // Function to retrieve a list of movies between two dates inclusive.
    // Calls the TMDB api and collects the movies returned.
    // Because the TMDB only returns one page at a time, with a maximum
    // of 20 results, we allow calling more than one page in parrallel.
    getMoviesBetweenDates: function(startDate, endDate, numberPages, callback){
      numberPages = numberPages || 1;
      var pagesReturned = 0;
      var movies = [];

      // function for the query callback used on line 54
      // defined here to avoid defining in a loop
      var queryCallback = function(results){
          // add resulting movies to the movies array
          movies = movies.concat(results.results);
          
          // increment the count of pages that have returned
          pagesReturned++;

          // if we are the last page to return
          // use >= for safety
          if(pagesReturned >= numberPages){
            // run the callback with the movies
            callback(movies);
          }
      };

      // Iterate through the number of pages and make a seperate parrallel
      // ajax request for each page.
      // NB: page is 1 indexed.
      for(var page = 1; page <= numberPages; page++){
        var params = {
          'primary_release_date.gte': startDate, // released after or on start date
          'primary_release_date.lte': endDate,   // released before or on end date
          'page': page
        };
        // for each page make a seperate request
        queryAPI(DISCOVER_PATH, params, queryCallback);
      }
    },
  };
}();

// Movie: a module to contain classes and utility functions for handling movie data
var Movie = {

  // Function to organise movie results by release date
  // takes an array of movies
  // returns an object where the keys are the date, in string form 'yyyy-mm-dd',
  // and the values are an array of movie json data
  // {'2017-01-10': [{..movie1}, {..movie2}] ...}
  organiseMoviesByDate: function(movies){
    var byDate = {};
    for(var i = 0; i < movies.length; i++){
      var movie = movies[i];
      var date = movie.release_date;
      byDate[date] = byDate[date] || [];
      byDate[date].push(movie);
    }
    return byDate;
  },
  // generate URL for a movie poster image
  // takes in the image path as returned in movie details json
  // example path is "/i9GUSgddIqrroubiLsvvMRYyRy0.jpg"
  moviePosterURL: function(path, large){
    var size = large ? '154' : '92';
    return "http://image.tmdb.org/t/p/w" + size + path;
  },
  // generate URL to view movie page on TMDB
  // takes movie id from json
  movieURL: function(id){
    return "http://www.themoviedb.org/movie/" + id;
  },

  // data object for movie display. Takes the raw json data
  // and generates properties for the handlebars templates
  // used by weekview and dayview
  movieData: function(json){
    return(
      {
        id: json.id,
        title: json.title,
        posterPath: json.poster_path,
        overview: json.overview,
        tmdbURL: Movie.movieURL(json.id)
      }
    );
  }
};
