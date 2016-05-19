import * as express from 'express';
import {join} from 'path';
import * as logger from 'morgan';
import cookieParser = require('cookie-parser'); // this module doesn't use the ES6 default export yet
import * as bodyParser from 'body-parser';

import index from './routes/index';

let app: any = express();

// view engine setup
app.set('views', join(__dirname, './views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
// app.use(favicon(join(__dirname, '../public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(join(__dirname, '../public')));
app.use(express.static(join(__dirname, '../public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use((req: any, res: any, next: any) => {
  let err: any = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {

  app.use((error: any, req: any, res: any, next: any) => {
    res.status(error.status || 500);
    res.render('error', {
      message: error.message,
      error
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((error: any, req: any, res: any, next: any) => {
  res.status(error.status || 500);
  res.render('error', {
    error: {},
    message: error.message
  });
  return undefined;
});

export default app;
