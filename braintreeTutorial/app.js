var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var checkoutRouter = require('./routes/checkout');

// Create the Express instance
var paymentApp = express();

// View engine setup
paymentApp.set('views', path.join(__dirname, 'views'));
paymentApp.set('view engine', 'hbs');

// Middleware
paymentApp.use(logger('dev'));
paymentApp.use(express.json());
paymentApp.use(express.urlencoded({ extended: false }));
paymentApp.use(cookieParser());
paymentApp.use(express.static(path.join(__dirname, 'public')));

// Routes
paymentApp.use('/', indexRouter);
paymentApp.use('/users', usersRouter);
paymentApp.use('/checkout', checkoutRouter);

// 404 and error handlers
paymentApp.use(function(req, res, next) {
  next(createError(404));
});

paymentApp.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = paymentApp.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Export the app instead of listening on a port
module.exports = paymentApp;
