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
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json()); // Prepare to parse POST data

// get Watson credentials
var fileSystem = require('fs');
var watsonAuthInfo = JSON.parse(fileSystem.readFileSync('./watsoncredentials.json', 'utf8'));
var watson = require('watson-developer-cloud');
var personality_insights = watson.personality_insights(watsonAuthInfo.credentials);

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
	console.log('Request received: ' + req.method);
	if (req.method == 'OPTIONS'){
		res.sendStatus(200);
	} else {
		next();
	}
});

// =================================================
// Serves the API functionality from the server root
// =================================================
app.post('/', function(req, res, next){
	//res.set('Content-Type', 'text/plain');
	var query = req.body.query;
	var data = {}; // Return data will be in JSON format and stored here.
	console.log('Request payload: ' + query.length + ' bytes');

	if (query === undefined){
		// Usage: API calls must include a JSON object with a "query" attribute
		data['error'] = 'Parameters missing.';
		res.send(data);
  } else {
		if (query === 'TESTMODE'){
			// This 'test mode' returns sample data for front-end development, saving API calls.
			fileSystem.readFile('./testdata.json', function (ferr, fdata) {
			  if (ferr) throw ferr;
			  res.send(fdata);
			});

		} else {
			// Invokes Watson's personality insights
			personality_insights.profile({ text: query },
			  function (err, response) {
			    if (err) {
			    	data['error'] = err;
			    } else {
			        data['response'] = response;
			        data['input'] = query;
		        }
		        // Finally, return the results of our hard work.
		        res.send(data);
			});
		}
	}
});

// start server on the specified port and binding host
var srvPort = process.env.PORT || 6001
app.listen(srvPort, function() {
  	console.log("server listening on port " + srvPort);
});
