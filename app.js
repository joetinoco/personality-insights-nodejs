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

var express = require('express');
var cors = require('cors'); // For cross-site access

// cfenv provides access to IBM's Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server and set up CORS parameters
var app = express();
app.options('*', cors());
app.options('/', cors());
app.use(cors());

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// get Watson credentials
var fileSystem = require('fs');
var watsonAuthInfo = JSON.parse(fileSystem.readFileSync('./watsoncredentials.json', 'utf8'));
var watson = require('watson-developer-cloud');
var personality_insights = watson.personality_insights(watsonAuthInfo.credentials);

// Prepare to parse POST data
var bodyParser = require('body-parser');
app.use(bodyParser.json());

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
  	console.log("server starting on " + appEnv.url);
});
