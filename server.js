'use strict';

/********
 
 OPRECARC
 ARC 2016

 ********/

console.log(':: oprecarc ::');
console.log('NODE_ENV: %s\n', process.env.NODE_ENV);

// Load components that are needed here
var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var config = require('config');

// Load configured app components that are needed here
var winston = require('./app/components/winston.js');

// Set constants
global.appDirectory = __dirname;
global.uploadDirectory = path.join(__dirname, 'data/uploads');
var routeDirectory = path.join(__dirname, 'app/routes');
var viewDirectory = path.join(__dirname, 'app/views');

// Apply global Express settings
app.set('views', viewDirectory);
app.set('view engine', 'pug');

// Apply global Express middleware
winston.log('verbose', 'Using Express static middleware...');

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('./app/components/session.js');
var passport = require('./app/components/passport.js');
var flash = require('connect-flash');
var locals = require('./app/components/locals.js');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'bower_components')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(session);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(locals);

// Load and apply routes
winston.log('verbose', 'Loading and applying routes...');
fs.readdirSync(routeDirectory).forEach(function (file) {
  var routerPath = path.join(routeDirectory, file);

  if (path.extname(routerPath) === '.js') {
    winston.log('verbose', routerPath);
    var router = require(routerPath);
    var routerName = path.basename(routerPath, path.extname(routerPath));
    if (!router.baseRoute) router.baseRoute = '/';
    var completeRoute = config.get('routePrefix') + router.baseRoute;
    winston.log('verbose', 'Using route %s...', completeRoute);
    app.use(completeRoute, router);
  }
});

// Apply Express error and 404 handler
// TODO:
winston.log('warn', 'Still using default Express error handler, please implement custom error handlers');

// Start the server
winston.log('verbose', 'Starting the HTTP server...');
server.listen(config.get('port'), config.get('ip'), function () {
  var address = server.address();
  winston.log('info', 'oprecarc listening at http://%s:%s', address.host, address.port);
});
