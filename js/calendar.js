"use strict";
// Calendar module, with classes and functions for calendar display
var Calendar = {
  getDateStr: function(date){
    return date.format('YYYY-MM-DD');
  }
};

/** MONTH VIEW **/

// Month view: Class defining state of calendar month view, with display methods.
Calendar.MonthView = function(date){
  // 'date' parameter could be
  // a date string from routing => '2017-08-01'
  // or null, in which case defalt to current date
  this.date = moment(date);
  
  // Title for display in the calendar header
  this.title = this.date.format('MMMM YYYY');

  // Next and previous date strings. For use by the next and previous buttons
  this.nextDateStr = Calendar.getDateStr(moment(this.date).add(1, 'month'));
  this.prevDateStr = Calendar.getDateStr(moment(this.date).subtract(1, 'month'));
  
  // Set up array of weeks for display
  this.initWeeks();
};

// Method to calculate the start date for this month
// The first date displayed on the calendar for this month is 
// the monday of the week containing the first of the month
Calendar.MonthView.prototype.startDate =  function(){
  var startDate = moment(this.date); // clone this.date
  // set date to first of month and then first of week
  startDate.startOf('month').startOf('isoweek'); // isoweek starts Monday
  return startDate;
};

// Method to calculate the end date for this month
// The last date displayed on the calendar for this month is 
// the sunday of the week containing the last day of the month
Calendar.MonthView.prototype.endDate =  function(){
  var endDate = moment(this.date); // clone this.date
  // set date to end of month and then end of week
  endDate.endOf('month').endOf('isoweek'); // isoweek starts Monday
  return endDate;
};

// Function to initialise the array of weeks for the calendar month
// Each week will be an array of seven Calendar.MonthViewDay instances
Calendar.MonthView.prototype.initWeeks =  function(){
  this.weeks = [];
  var endDate = this.endDate();
  var refDate = this.startDate();

  // There are a maximum of 5 weeks in a month view
  // First iterate the weeks
  for(var weekNum = 0; weekNum < 5; weekNum++){
    // If we are still within the month..
    if(refDate.isBefore(endDate)){
      // Initialise an array representing the week
      var week = [];
      // Iterate through the seven days of the week
      for(var dayNum = 0; dayNum < 7; dayNum++ ){
        // Add a Calendar.MonthViewDay instance into the array for the current day
        // Passing in this.date for currentMonthDate parameter
        week.push(new Calendar.MonthViewDay(refDate, {currentMonthDate: this.date}));
         // Now increment the refDate by 1 day.
        refDate.add(1, 'day');
      }
      // The week is now filled. Add it to the weeks array.
      this.weeks.push(week);
    }
  }
};

// Method to load the movie data for this month
// Retrieves the movies within this month from the api and distributes them into the 
// correct MonthViewDay instances
Calendar.MonthView.prototype.loadMovies = function(callback){
  var self = this;
  var startStr = Calendar.getDateStr(this.startDate());
  var endStr = Calendar.getDateStr(this.endDate());

  // We need to retrieve as many movies as we can, to try and have at least one per day.
  // We retrieve 5 pages of movies, which is 5 seperate ajax calls and around 100 movies
  theMovieDB.getMoviesBetweenDates(startStr, endStr, 5, function(data){ 
    // On reciept of the movies, organise them by date
    var moviesByDate = Movie.organiseMoviesByDate(data);
    // Iterate through the weeks
    for(var weekNum = 0; weekNum < self.weeks.length; weekNum++){
      // For each week iterate through the days
      for(var dayNum = 0; dayNum < 7; dayNum++){
        var day = self.weeks[weekNum][dayNum];
        if(day){
          // Retrieve any movies loaded for the relevant day
          var movies = moviesByDate[day.dateStr];
          // if there are any movies
          if(movies){
            // set the first movie (top rated) as the main movie for the day
            day.setMainMovie(movies[0]);
          }
        }
      }
    }
    // On completion, run the callback function
    callback();
  });
};

// Function to render the month view within the page
Calendar.MonthView.prototype.render = function(){
  // need to locally assign this so it is in scope for the callback closure
  var self = this;
  // render the monthview template immediately
  calendarApp.renderTemplate("monthview-template","main-view-content",self);
  
  // load up the movies
  this.loadMovies(function(){
    // when movies are loaded fade in the month view data template
    calendarApp.renderTemplate("monthview-data-template","monthview-data",self, true);
  });
};


// Class representing a single day within the month view
// Contains the attributes used by the handlebars template
Calendar.MonthViewDay = function(date, options){
  this.date = moment(date);
  this.dateStr = Calendar.getDateStr(this.date);
  this.dayOfMonth = this.date.format('DD');
  // is this day a day of the month being viewed
  // enables the template to distinguish days in the first and last
  // week of the month view that are the previous or next month respectively
  // E.G if the 1st March is a Wednesday, the Monday and Tuesday of the first week displayed will be in April
  this.notCurrentMonth = false;
  if(options){
    if(options.currentMonthDate){
      // This day is not in the current month if it's month is different from the reference date passed in
      this.notCurrentMonth = (this.date.month() != options.currentMonthDate.month());
    }
  }
};

// Set the main movie to be displayed in this day cell
Calendar.MonthViewDay.prototype.setMainMovie = function(movieData){
  this.hasMovie = true;
  this.posterPath = movieData.poster_path;
};


/** WEEK VIEW **/

// Week view: Class defining state of calendar week view, with display methods.
Calendar.WeekView = function(date){
  // 'date' parameter could be
  // a date string from routing => '2017-08-01'
  // or null, in which case defalt to current date
  this.date = moment(date);

  // Title for display in the calendar header
  this.title = this.getTitle();
  // Next and previous date strings. For use by the next and previous buttons
  this.nextDateStr = Calendar.getDateStr(moment(this.date).add(1, 'week'));
  this.prevDateStr = Calendar.getDateStr(moment(this.date).subtract(1, 'week'));
  
  // Set up array of days for display
  this.initDays();
};

// Method to calculate the start date for this week which is the
// which is the Monday of the week of this.date
Calendar.WeekView.prototype.startDate =  function(){
  var startDate = moment(this.date); // clone this.date
  // Set startDate to the start of the week
  startDate.startOf('isoweek'); // isoweek starts Monday
  return startDate;
};

// Method to calculate the end date for this week which is the
// which is the Sunday of the week of this.date
Calendar.WeekView.prototype.endDate =  function(){
  var endDate = moment(this.date); // clone this.date
  // Set endDate to the end of the week
  endDate.endOf('isoweek'); // isoweek starts Monday
  return endDate;
};

// Method to generate a week title.
// The format will depend on whether the week spans more than one month / year
// E.G
// 7th - 13th Aug 2017
// 28th Aug - 3rd Sep 2017
// 26th Dec 2016 - 1st Jan 2017
Calendar.WeekView.prototype.getTitle =  function(){
  var startDate = this.startDate();
  var endDate = this.endDate();

  // Default start format is just the ordinal day of month
  var startFormat = "Do"; //E.G '7th'
  
  // End format is always day month and year
  var endFormat = "Do MMMM YYYY"; //E.G '7th January 2017'
  
  if(startDate.month() != endDate.month()){
    if(startDate.year() != endDate.year()){
      // If the years are different the start format is the full day month and year
      // which = endFormat
      startFormat = endFormat;
    }else{
      // If the months are different, the start format is just the day and month
      startFormat = "Do MMMM"; // E.G 4th January
    }
  }
  // return "<start> - <end>"
  return startDate.format(startFormat) + " - " + endDate.format(endFormat);
};

// Function to initialise the array of days for the calendar week
// which is an array of seven Calendar.WeekViewDay instances
Calendar.WeekView.prototype.initDays =  function(){
  this.days = [];
  var refDate = this.startDate();
  // Iterate through the seven days of the week
  for(var dayNum = 0; dayNum < 7; dayNum++ ){
    // Add a Calendar.WeekViewDay instance into the array for the current day
    this.days.push(new Calendar.WeekViewDay(refDate));
    // Increment the refDate by one day
    refDate.add(1, 'day');
  }
};

// Method to load the movie data for this week
// Retrieves the movies within this week from the api and distributes them into the 
// correct WeekViewDay instances
Calendar.WeekView.prototype.loadMovies = function(callback){
  var self = this;
  var startStr = Calendar.getDateStr(this.startDate());
  var endStr = Calendar.getDateStr(this.endDate());
  // We need to retrieve as many movies as we can, to try and have at least one per day.
  // We retrieve 4 pages of movies, which is 4 seperate ajax calls and around 100 movies
  theMovieDB.getMoviesBetweenDates(startStr, endStr, 4, function(data){
    // On reciept of the movies, organise them by date
    var moviesByDate = Movie.organiseMoviesByDate(data);
    // Iterate through the days of the week
    for(var dayNum = 0; dayNum < 7; dayNum++){
      var day = self.days[dayNum];
      if(day){
        // Retrieve any movies loaded for the relevant day
        var movies = moviesByDate[day.dateStr];
        if(movies){
          // If there are any movies add them into the week's movies array
          // For display purposes limit to 10 movies per day
          for(var i = 0; i < movies.length && i < 10; i++){
            // for each movie, call Movie.movieData and add it to the day's movies array
            day.movies.push(Movie.movieData(movies[i]));
          }
        }
      }
    }
    // On completion, run the callback function
    callback();
  });
};

// Function to render the week view within the page
Calendar.WeekView.prototype.render = function(){
  // need to locally assign this so it is in scope for the callback closure
  var self = this;
  // render the weekview template immediately
  calendarApp.renderTemplate("weekview-template","main-view-content",self);
  // load up the movies
  this.loadMovies(function(){
    // when movies are loaded fade in the week view data template
    calendarApp.renderTemplate("weekview-data-template","weekview-data",self, true);
  });
};

// Class representing a single day within the week view
// Contains the attributes used by the handlebars template
Calendar.WeekViewDay = function(date){
  this.date = moment(date);
  this.dateStr = Calendar.getDateStr(this.date);
  this.title = this.date.format('dddd Do MMMM YYYY');
  this.movies = [];
};


/** DAY VIEW **/

// Day view: Class defining state of calendar day view, with display methods.
Calendar.DayView = function(date){
  // 'date' parameter could be
  // a date string from routing => '2017-08-01'
  // or null, in which case defalt to current date
  this.date = moment(date);

  // Title for display in the calendar header
  this.title = this.date.format('dddd Do MMMM YYYY');
  // Boolean indicating if this day has any movie data
  this.hasMovies = false;

  // Next and previous date strings. For use by the next and previous buttons
  this.nextDateStr = Calendar.getDateStr(moment(this.date).add(1, 'day'));
  this.prevDateStr = Calendar.getDateStr(moment(this.date).subtract(1, 'day'));
};

// Method to load the movie data for this day
// Retrieves the movies within for this day the api and adds them to the
// movies array
Calendar.DayView.prototype.loadMovies = function(callback){
  var self = this;
  var dateStr = Calendar.getDateStr(this.date);
  
  // Pass in dateStr as start and end date.
  // getMoviesBetweenDates is inclusive of start and end date.
  // In this case we only need one page of data
  theMovieDB.getMoviesBetweenDates(dateStr, dateStr, 1, function(data){
    if(data && data.length > 0){
      // Set the hasMovies boolean to true
      self.hasMovies = true;
      // Instantiate the movies
      self.movies = [];
      for(var i = 0; i < data.length; i++){
        // for each movie, call Movie.movieData and add it to the movies array
        self.movies.push(Movie.movieData(data[i]));
      }  
    }
    // On completion, run the callback function
    callback();
  });
};

// Function to render the day view within the page
Calendar.DayView.prototype.render = function(){
  // need to locally assign this so it is in scope for the callback closure
  var self = this;
  // render the dayview template immediately
  calendarApp.renderTemplate("dayview-template", "main-view-content", self);
  // load up the movies
  this.loadMovies(function(){
    // when movies are loaded fade in the day view data template
    calendarApp.renderTemplate("dayview-data-template","dayview-data", self, true);
  });
};
