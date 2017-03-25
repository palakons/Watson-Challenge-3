/**
 * The application entry point
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import domainMiddleware from 'express-domain-middleware';
import { errorHandler, notFoundHandler } from 'express-api-error-handler';
import config from 'config';
import './bootstrap';
import routes from './routes';
import loadRoutes from './common/loadRoutes';
import logger from './common/logger';

const app = express();
app.set('port', config.PORT);

//============== MY CODE ================

//console.log('PERSONALITY_INSIGHTS_USERNAME');
//console.log(process.env.PERSONALITY_INSIGHTS_USERNAME);
const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
const personalityInsights = new PersonalityInsightsV3({
  // If unspecified here, the PERSONALITY_INSIGHTS_USERNAME and
  // PERSONALITY_INSIGHTS_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided
  // VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  version_date: '2016-10-19',
});

app.get('/', function (req, res) {


  function getInsights(string) {
    return new Promise((resolve, reject => {

    }));
  }

  var txt = 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test ';
  //==== CALL IBM
  var params = {
    // Get the content items from the JSON file.
    content_items: [{ 'content': txt }],
    consumption_preferences: true,
    raw_scores: true,
    headers: {
      'accept-language': 'en',
      'accept': 'application/json'
    }
  };
  //==== CALL IBM END

  new Promise((resolve, reject) => {
    personalityInsights.profile(params, (error, response) => {
      if (error) {
        //console.log('Error:', error);
        reject(error);
      } else {
        //console.log(JSON.stringify(response, null, 2));
        resolve(response);
      }
    });

  }).then((response) => {
    console.log('done ok');
    res.status(200).json(response);
  }).catch((error) => {
    res.status(200).json(error);
  });
  console.log('done');
});

//============== MY  END ================

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(domainMiddleware);


const apiRouter = new express.Router();

loadRoutes(apiRouter, routes);

app.use('/api', apiRouter);

app.use(errorHandler({
  log: ({ err, req, body }) => {
    logger.error(err, `${body.status} ${req.method} ${req.url}`);
  },
}));

app.use(notFoundHandler({
  log: ({ req }) => {
    logger.error(`404 ${req.method} ${req.url}`);
  },
}));

if (!module.parent) {
  app.listen(app.get('port'), () => {
    logger.info(`Express server listening on port ${app.get('port')} in ${process.env.NODE_ENV} mode`);
  });
}

export default app;
