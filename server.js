var express 			= require('express');  
var app 				= express();  
var httpServer			= require('http').createServer(app);  
var bodyParser  		= require('body-parser');
var api 				= require('./api');

app.use(bodyParser.urlencoded({
  extended: false //encoded data with the querystring library 
}));

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.use('/api', api);		//api for remoted clients

app.get('*', function(req, res){
  res.send('what???', 404); //wrong route
});

console.log("HTTP API on 8711");
httpServer.listen(8711); 	//http
