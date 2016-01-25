/*jshint node:true*/

//------------------------------------------------------------------------------
// BLABLABRA INSIGHTS API
//
// Provides a "personality analysis" for text extracted from a region's tweets.
// Uses IBM Watson's "Personality Insights" API.
//
// This code was built upon node.js starter application for Bluemix.
//
//------------------------------------------------------------------------------
'use strict';

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to IBM's Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.sendStatus(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// get Watson credentials
var fileSystem = require('fs');
var watsonAuthInfo = JSON.parse(fileSystem.readFileSync('./watsoncredentials.json', 'utf8'));
var watson = require('watson-developer-cloud');
var personality_insights = watson.personality_insights(watsonAuthInfo.credentials);

// Prepare to parse submitted info
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// app.use(function(req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
// 	res.setHeader('Access-Control-Allow-Methods', 'POST');
//   res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// =================================================
// Serves the API functionality from the server root
// =================================================
app.post('/', function(req, res){
	res.set('Content-Type', 'text/plain');
	var data = {}; // Return data will be in JSON format and stored here.

	// Usage: API calls must include a JSON object with a "query" attribute
	if (req.body.query === undefined){
		data['error'] = 'Parameters missing.';
		res.send(data);
	} else {
		if (req.body.query === 'TESTMODE'){
			// This 'test mode' returns sample data for front-end development, saving API calls.
			fileSystem.readFile('./testdata.json', function (ferr, fdata) {
			  if (ferr) throw ferr;
			  res.send(fdata);
			});

		} else {
			// Invokes Watson's personality insights
			personality_insights.profile({ text: req.body.query },
			  function (err, response) {
			    if (err) {
			    	data['error'] = err;
			    } else {
			        data['response'] = response;
			        data['input'] = req.body.query;
		        }
		        // Finally, return the results of our hard work.
		        res.send(data);
			});
		}
	}
});

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {
	// print a message when the server starts listening
  	console.log("server starting on " + appEnv.url);
});
