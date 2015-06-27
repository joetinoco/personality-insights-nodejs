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

// serve the files out of ./public as our main files
//app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// =================================================
// Serves the API functionality from the server root
// =================================================
app.get('/', function(req, res){
	var data = {}; // Return data will be in JSON format and stored here.
	res.set('Content-Type', 'text/plain');
	res.set('Access-Control-Allow-Origin', 'blablabra.net, localhost');

	// Usage: API calls must include a query parameter, 'q'
	if (req.query.q === undefined){
		data['error'] = 'Parameters missing.';
		res.send(data);
	} else {
		if (req.query.q === 'TESTMODE'){
			// This 'test mode' returns sample data for front-end development, saving API calls.
			var fs = require('fs');
			fs.readFile('./testdata.json', function (ferr, fdata) {
			  if (ferr) throw ferr;
			  res.send(fdata);
			});

		} else {
			// Invokes Watson's personality insights
			var watson = require('watson-developer-cloud');
			var personality_insights = watson.personality_insights({
			  username: '6dd0d668-3d95-42ac-89c6-df0e12409098',
			  password: 'LFB7Hdjw5jmF',
			  version: 'v2'
			});
			personality_insights.profile({ text: req.query.q },
			  function (err, response) {
			    if (err) {
			    	data['error'] = err;
			    } else {
			        data['response'] = response;
			        data['input'] = req.query.q;
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
