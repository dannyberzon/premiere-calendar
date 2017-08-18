"use strict";
// Object representing the single page web app.
// Maintains a reference to the current view
// and handles routing, rendering templates and
// responding to user interactions
var calendarApp = function(){

  // variable representing the current calendar view
  var currentView = null;

  // Define the valid routes for user navigation controls.
  // Key is the route, representing the first part of the hash.
  // Value is the function that performs the navigation.
  // The remainder of the hash will be passed as a parameter to the function.
  // E.G. '#day/2017-02-02' will call the function with key 'day'
  // and will pass the string '2017-02-02' as a parameter
  var routeMap = {
    // eg 'month/2017-01-01'
    month: function(param){
      calendarApp.gotoMonth(param);
    },
    // eg 'week/2017-01-01'
    week: function(param){
      calendarApp.gotoWeek(param);
    },
    // eg 'day/2017-01-01'
    day: function(param){
      calendarApp.gotoDay(param);
    },
    // Root url should go to month view for current month.
    '': function(){
      calendarApp.gotoMonth();
    }
  };

  // Function to initialize spinner while data is loading.
  // Uses spin.js http://spin.js.org/
  var spinLoader = function(){
    // Spinner options
    var opts = {
      lines: 12, length: 28, width: 10, radius: 42,
      scale: 0.7, color: '#ccc', position: 'relative'
    };
    // Retrieve the spinner div and initialize it
    var target = $('#spinner')[0];
    new Spinner(opts).spin(target);
  };

  // Local cache of compiled handlebars templates.
  // In the absense of precompiled templates this will at least speed up
  // endering a template, rather than retrieving the html and compiling each time
  var cachedTemplates = {};

  return {
    // Public functions for routing

    // Navigate to a specific month
    gotoMonth: function(date){
      currentView = new Calendar.MonthView(date);
      currentView.render();
      spinLoader();
    },

    // Navigate to a specific month
    gotoWeek: function(date){
      currentView = new Calendar.WeekView(date);
      currentView.render();
      spinLoader();
    },

    // Navigate to a specific month
    gotoDay: function(date){
      currentView = new Calendar.DayView(date);
      currentView.render();
      spinLoader();
    },

    // Method to retrive and render a handlebar template.
    // Template element will be retrieved, compiled and run with 
    // the incoming context, replacing the html of the target
    // templateID: the dom ID of the template element
    // targetID: the dom ID of the target element
    // context: the context for running the template
    // fade: whether the resulting dom element should fade in
    renderTemplate: function(templateID, targetID, context, fade){
      // Retrieve the template from the cache if it's already been compiled
      var template = cachedTemplates[templateID];
      if(! template){
        // If not, retrieve the template from the DOM and compile it
        // adding it to the local cache
        var source   = $("#" + templateID).html();
        template = Handlebars.compile(source);
        cachedTemplates[templateID] = template;
      }

      var target = $("#" + targetID);
      // If the fade parameter is true, fade in the new dom element 
      if(fade){
        target.hide().html(template(context)).fadeIn(500);
      }else{
        target.html(template(context));
      }
    },

    // Handle user navigation.
    // Incoming parameter is the hash of the new page location
    // Compare the hash to the route map and navigate accordingly if there is a match
    navigate: function(hash){
      
      // Extract the route and parameter from the hash
      // eg. '#day/2017-01-01' => route = 'day', parameter = '2017-01-01'

      // Split hash by '/' character
      var pathArr = hash.split('/');

      // Route is the first part, removing the '#' character if it's there
      var route = pathArr[0].replace(/^#/, "");
      
      // The part after the / is the parameter for the route
      var parameter = pathArr[1];

      // Get the navigation function out for the route.
      // If route is not recognised default to root ('')
      var routeFunction = (routeMap[route] || '');

      // Call the route function, passing the parameter
      routeFunction(parameter);
    },

    navigateToPageURL: function(){
      this.navigate(decodeURI(window.location.hash)); // Call to decodeURI in case we pass in special characters
    } 
  };
}();

// Set up an event handler that listens for hashchange
// and calls calendarApp.navigateToPageURL
$(window).on('hashchange', function(){
  calendarApp.navigateToPageURL();
});

// Register helpers with handlebars for displaying a movie posters
Handlebars.registerHelper('posterImg', function(path, large) {
  var url = Movie.moviePosterURL(path, large);
  return new Handlebars.SafeString("<img src=\"" + url +  "\"></img>");
});

// Register partials with handlebars for displaying the calendar view select and the calendar header
Handlebars.registerPartial('calendarViewSelect', $('#calendar-view-select-partial').html());
Handlebars.registerPartial('calendarHeader', $('#calendar-header-partial').html());

// initialise the page by navigating to the current URL
// This allows for pages to be bookmarked
calendarApp.navigateToPageURL();
