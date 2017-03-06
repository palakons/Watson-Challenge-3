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
import extend from 'extend';
var request = require('request');
var http = require('http');
var Cloudant = require('cloudant');
var stylus = require('stylus');
var nib = require('nib');


const app = express();
app.set('port', config.PORT);


app.set('view engine', 'jade');
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.set('views', __dirname + '/../views')
app.set('view engine', 'jade')
//app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/../public'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/../public'));
// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
	translator.getIdentifiableLanguages(null,
    function (err, languages) {
        if (err)
            console.log(err)
        else {
        	var params = extend({ title : 'COGNATIVE COMPANY'},languages);
        	res.render('index',params);
        }
	});
});


// FUNCTIONS ================================================
function makeTranslation(sourceText, sourceLanguageCode, destinationLanguageCode, sourceTextTone, translatedText, translatedTextTone) {
	return {
		'Translation': {
			'sourceText': sourceText
			, 'sourceLanguageCode': sourceLanguageCode
			, 'destinationLanguageCode': destinationLanguageCode
			, 'sourceTextTone': sourceTextTone
			, 'translatedText': translatedText
			, 'translatedTextTone': translatedTextTone
		}
	};
}
function makeError(code, message) {
	return {
		'Error': {
			'code': code
			, 'message': message
		}
	};
}

//create a database
var createDatabase = function (callback) {
 console.log("Creating database '" + dbname + "'");
 cloudant.db.create(dbname, function (err, data) {
     console.log("Error:", err);
     console.log("Data:", data);
     db = cloudant.db.use(dbname);
     callback(err, data);
 });
 
};

//create a document
var createDocument = function(data,callback) {
console.log("Creating document 'data'");
//we are specifying the id of the document so we can update and delete it later
db.insert(data, function(err, data) {
console.log("Error:", err);
console.log("Data:", data);
callback(err, data);
});
};


//read a document
var readDocument = function (params,callback) {
 console.log("Reading document 'mydoc'");
 db.list({include_docs:true,
	 "sort": [{"time": "desc"}],
	  "limit": params.limit,
	  "skip": params.offset
	  }
 , function (err, data) {
     console.log("Error:", err);
     console.log("Data:", data);
     // keep a copy of the doc so we know its revision token
     callback(err, data);
 });
};

// ========================================================================

var LanguageTranslatorV2 = require('watson-developer-cloud/language-translator/v2');
var translator = new LanguageTranslatorV2({
	// If unspecified here, the LANGUAGE_TRANSLATOR_USERNAME and
	// LANGUAGE_TRANSLATOR_PASSWORD environment properties will be checked
	// After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES
	// environment property
	// username: '<username>',
	// password: '<password>'
	url: 'https://gateway.watsonplatform.net/language-translator/api'/*
																	 * ,
																	 * use_unauthenticated:
																	 * process.env.use_unauthenticated
																	 * ===
																	 * 'true'
																	 */
});

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var toneAnalyzer = new ToneAnalyzerV3({
	// If unspecified here, the TONE_ANALYZER_USERNAME and
	// TONE_ANALYZER_PASSWORD environment properties will be checked
	// After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES
	// environment property
	// username: '<username>',
	// password: '<password>',
	version_date: '2016-05-19'
});

//Obtain the db interface from VCAP_SERVICES
if (process.env.VCAP_SERVICES) {
	  // Running on Bluemix. Parse the process.env for the port and host that we've been assigned.
	  var env = JSON.parse(process.env.VCAP_SERVICES);
	  var host = process.env.VCAP_APP_HOST; 
	  var port = process.env.VCAP_APP_PORT;
	  console.log('VCAP_SERVICES: %s', process.env.VCAP_SERVICES);    
	  // Also parse out Cloudant settings.
	  var cloudant = Cloudant(env['cloudantNoSQLDB'][0]['credentials']);
	  var dbname  = 'history';
	  var db = null;
}
createDatabase(function (err, data) {
    if (err && err.statusCode != 412) { //error or db existed
        console.log('DB Create Error ' + JSON.stringify(err));
    } 
});
var availableLanguages = null;



/*
 * 3. Create a GET API request with 2 endpoints - /api/translate - /api/history
 */



app.get('/api/translate', function (req, res, next) {
    console.log('/v2/translate');

    var textSource = { 'source': req.query.sourceLanguageCode, 'target': req.query.destinationLanguageCode, 'text': req.query.sourceText };

    console.log(JSON.stringify(req.query));
    // check if inputs are defined
    if(req.query.sourceLanguageCode == undefined || req.query.destinationLanguageCode== undefined || req.query.sourceText== undefined ){
    	res.status(400).json(makeError('400','sourceLanguageCode,destinationLanguageCode and sourceText must be defined.'));
    }
    // check if inputs are non-empty
    else if (req.query.sourceLanguageCode == '' || req.query.destinationLanguageCode == '' || req.query.sourceText == '') {
        res.status(400).json(makeError('400', 'sourceLanguageCode, destinationLanguageCode and sourceText must be non-empty.'));
    } else {

        // check if language code exists
        translator.getIdentifiableLanguages(null,
            function (err, languages) {
                if (err)
                    console.log(err)
                else {
                    var sourceLanguageCodeOK = false;
                    var targetLanguageCodeOK = false;
                    availableLanguages = languages;
                    for (var i in languages.languages) {
                    	var ele = languages.languages[i];
                    	//console.log(JSON.stringify(ele));

                        if (ele.language === textSource.source) {
                            sourceLanguageCodeOK = true;
                            //console.log('matched'+textSource.source);
                        }
                        if (ele.language === textSource.target){
                            targetLanguageCodeOK = true;
                            //console.log('matched'+textSource.target);
                        }
                    }
                    if (!sourceLanguageCodeOK || !targetLanguageCodeOK)
                        res.status(400).json(makeError('400', 'Invalid sourceLanguageCode or destinationLanguageCode is not supported.'));
                    else
                        // check if language pair is OK
                        translator.getModels({ 'source': textSource.source }, function (err, models) {
                            if (err)
                                console.log(err)
                            else {
                                console.log('models');
                                //console.log(JSON.stringify(models));
                                var foundPair = false;
                                for( var i in models.models){
                                	if(models.models[i].target === textSource.target) {
                                		foundPair = true;
                                		break;
                                	}
                                }
                                if (!foundPair) {
                                    res.status(400).json(makeError('400', 'Invalid sourceLanguageCode / destinationLanguageCode combination.'));
                                } else {
                                    var params = extend({ 'X-WDC-PL-OPT-OUT': req.header('X-WDC-PL-OPT-OUT') }, textSource);
                                    translator.translate(params, function (err, models) {
                                        if (err)
                                            return next(err);
                                        else {

                                            var sourceTone = '';
                                            var targetTone = '';
                                            // call tone analyzer to source text
                                            toneAnalyzer.tone({ text: textSource.text },
                                                function (err, tone) {
                                                    if (err)
                                                        console.log(err);
                                                    else {
                                                        // console.log(JSON.stringify(tone, null, 2));
                                                        console.log('tone');
                                                        //console.log(JSON.stringify(tone));
                                                        for (var i in tone.document_tone.tone_categories) {

                                                            if(tone.document_tone.tone_categories[i].category_id == 'emotion_tone'){ 
	                                                            tone.document_tone.tone_categories[i].tones.sort(function (a, b) {
	                                                                return b.score - a.score;
	                                                            });
	                                                            sourceTone += tone.document_tone.tone_categories[i].tones[0].tone_name + ' ('+tone.document_tone.tone_categories[i].tones[0].score+')';
                                                             }
                                                        }
                                                        //sourceTone = sourceTone.substr(0,sourceTone.length-2);
                                                        // call tone analyzer to translated text
                                                        toneAnalyzer.tone({ text: models.translations[0].translation },
                                                            function (err, tone) {
                                                                if (err)
                                                                    console.log(err);
                                                                else {
                                                                    // console.log(JSON.stringify(tone, null,
                                                                    // 2));
                                                                    for (var i in tone.document_tone.tone_categories) {
                                                                        if(tone.document_tone.tone_categories[i].category_id == 'emotion_tone'){ 
	                                                                        tone.document_tone.tone_categories[i].tones.sort(function (a, b) {
	                                                                            return b.score - a.score;
	                                                                        });
	                                                                        targetTone += tone.document_tone.tone_categories[i].tones[0].tone_name + ' ('+tone.document_tone.tone_categories[i].tones[0].score+')';
                                                                        }
                                                                    }
                                                                    //targetTone = targetTone.substr(0,targetTone.length-2);
                                                                    // now we have all data
                                                                    var translationOutput = makeTranslation(textSource.text, textSource.source, textSource.target, sourceTone, models.translations[0].translation, targetTone);
                                                                    // push into DB
                                                                    createDocument(extend({'time':Date.now()},translationOutput), function (err, data) {
                                                                        if (err) {
                                                                            res.json(err);
                                                                        }
                                                                    });
                                                                    //return json
                                                                    console.log(JSON.stringify(translationOutput));
                                                                    res.status(200).json(translationOutput);
                                                                }
                                                            });
                                                    }
                                                });
                                        }
                                    });
                                }
                            }
                        });
                }
            });
    }
});
app.get('/api/history', function (req, res, next) {
    console.log('/v2/history');
    var offset = req.query.offset ? req.query.offset : 0;
    var limit = req.query.limit ? req.query.limit : 5;
    limit = Math.min(100, limit);
    //res.send('history<br/><pre>' + '</pre>');

	readDocument({'offset':offset, 'limit':limit},function (err, data) {
	    if(err ){ 
	        res.json(err);
	    }else{
	    	console.log('/rad data ok');
	    	console.log(JSON.stringify(data));
	    	//process data
	    	var translations = new Array();
	    	for(var i in data.rows){
		    	translations.push({'Translation':data.rows[i].doc.Translation});
	    	}
	        res.json(translations);
	    }
	});

});

/*app.get('/api/deletedb', function (req, res, next) {
    console.log('/deletedb');

    // deleting the database document
    var deleteDatabase = function (callback) {
        console.log("Deleting database '" + dbname + "'");
        cloudant.db.destroy(dbname, function (err, data) {
            console.log("Error:", err);
            console.log("Data:", data);
            callback(err, data);
            res.send('deleteDB<br/><pre>' + '</pre>');
        });

        deleteDatabase(function (err, data) {
        	console.log(err);
            console.log(data);
        });
    };
}); */

	/*
	 * 4. Implement the API defined in the attached Swagger doc. You may use
	 * editor.swagger.io generators if you wish. You also do not have to follow the
	 * API to the letter. As long as the inputs and outputs work as required, you
	 * are welcome to make additions or corrections as you see fit.
	 */

	/*
	 * 5. Create a very simple UI that uses the above Api. A sample UI screenshot
	 * are provided below. UI is provided for demonstration only, and not
	 * necessarily to implement as is. Feel free to experiment with the UI. You will
	 * not be critiqued on the design of your UI, only the functionality surfaced in
	 * it.
	 */

	// ========================================================================

	app.use(cors());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
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
