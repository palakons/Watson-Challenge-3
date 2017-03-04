/**
 * The application entry point
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import domainMiddleware from 'express-domain-middleware';
import {errorHandler, notFoundHandler} from 'express-api-error-handler';
import config from 'config';
import './bootstrap';
import routes from './routes';
import loadRoutes from './common/loadRoutes';
import logger from './common/logger';

const app = express();
app.set('port', config.PORT);

//respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello not so big world, lol<br/><pre>');//+JSON.stringify(req)+'</pre>');
});

//========================================================================

var LanguageTranslatorV2 = require('watson-developer-cloud/language-translator/v2');
console.log(JSON.stringify(LanguageTranslatorV2));
var translator = new LanguageTranslatorV2({
  // If unspecified here, the LANGUAGE_TRANSLATOR_USERNAME and LANGUAGE_TRANSLATOR_PASSWORD environment properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>'
  url: 'https://gateway.watsonplatform.net/language-translator/api'
});


/*
3. Create a GET API request with 2 endpoints
- /api/translate
- /api/history
*/
app.post('/api/identify', function(req, res, next) {
  console.log('/v2/identify');
  var params = {
    text: req.body.textData,
    'X-WDC-PL-OPT-OUT': req.header('X-WDC-PL-OPT-OUT')
  };
  translator.identify(params, function(err, models) {
    if (err)
      return next(err);
    else
        res.json(models);
  });
});

app.get('/api/translate',  function(req, res, next) {
  console.log('/v2/translate');
  var params = extend({ 'X-WDC-PL-OPT-OUT': req.header('X-WDC-PL-OPT-OUT')}, req.body);
  translator.translate(params, function(err, models) {
    if (err)
      return next(err);
    else
      res.json(models);
  });
});
app.get('/api/history',  function(req, res, next) {
	  console.log('/v2/history');
});

/*
4. Implement the API defined in the attached Swagger doc.  You may use editor.swagger.io generators if you wish.  
You also do not have to follow the API to the letter.  
As long as the inputs and outputs work as required, you are welcome to make additions or corrections as you see fit.
*/

/*
5. Create a very simple UI that uses the above Api. A sample UI screenshot are provided below. 
UI is provided for demonstration only, and not necessarily to implement as is. Feel free to experiment with the UI.  
You will not be critiqued on the design of your UI, only the functionality surfaced in it.
*/

//========================================================================

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(domainMiddleware);


const apiRouter = new express.Router();

loadRoutes(apiRouter, routes);

app.use('/api', apiRouter);

app.use(errorHandler({
  log: ({err, req, body}) => {
    logger.error(err, `${body.status} ${req.method} ${req.url}`);
  },
}));

app.use(notFoundHandler({
  log: ({req}) => {
    logger.error(`404 ${req.method} ${req.url}`);
  },
}));

if (!module.parent) {
  app.listen(app.get('port'), () => {
    logger.info(`Express server listening on port ${app.get('port')} in ${process.env.NODE_ENV} mode`);
  });
}

export default app;
