'use strict';

var express 	= require('express');
var github 		= require('octonode');
var config 		= require('./config.json');

module.exports = (function() {
    
    var api = express.Router();
	var client = github.client({
		  username: config.username,
		  password: config.password
		});
	
	//get issues route
	api.get('/issues/:user/:repo', function(req, res)
	{
		var ghrepo  = client.repo(req.params.user+"/"+req.params.repo);
		ghrepo.issues(function(err,data,headers)
		{
			if(err) // When requesting invalid git usernames, the API should return a logical error message and status code
			{
				return res.send('what???', 404);
			}
			// format result to the specifed structure
			var result = {"issues":[]};
			for(var i in data)
			{
				var tags = [];
				for(var j in data[i].labels)
				{
					tags.push(data[i].labels[j].name);
				}
				tags.sort(); //Tag names within each issue should be sorted alphabetically.
				result.issues.push({"url": data[i].html_url, "title": data[i].title, "tags": tags});
			}
			//Issues should be sorted (alphabetically) by the first tag.
			//Issues with no tags should come first.
			result.issues.sort(function(i1, i2){
				if(i1.tags.length==0)
				{
					return false;
				}
				if(i2.tags.length==0)
				{
					return true;
				}
				var min_val = Math.min(i1.tags.length, i2.tags.length);
				for(i = 0; i < min_val; i++)
				{
					if(i1.tags[i] != i2.tags[i])
					{
						return i1.tags[0] > i2.tags[0];
					}
				}
			});
			return res.send(result);
		}); 
	});
	
    return api;
})();