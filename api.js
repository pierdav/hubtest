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
	
	//get issues route for user
	api.get('/issues/:user', function(req, res)
	{
		/* all repos for user */
		var getUserRepos = function(cb)
		{
			var ghuser  = client.user(req.params.user);
			ghuser.repos(function(err,data,headers)
			{
				if(err) // When requesting invalid git usernames, the API should return a logical error message and status code
				{
					return res.send('what???', 404);
				}
				return cb(data);
			}); 
		}
		/* all issues for repo */
		var getRepoIssues = function(name, cb)
		{
			var ghrepo  = client.repo(req.params.user+"/"+name);
			ghrepo.issues(function(err,data,headers)
			{
				if(err) // When requesting invalid git usernames, the API should return a logical error message and status code
				{
					return res.send('what???', 404);
				}
				// format result to the specifed structure
				var issues = [];
				for(var i in data)
				{
					var tags = [];
					for(var j in data[i].labels)
					{
						tags.push(data[i].labels[j].name);
					}
					tags.sort(); //Tag names within each issue should be sorted alphabetically.
					issues.push({"url": data[i].html_url, "title": data[i].title, "tags": tags});
				}
				return cb(issues);
			}); 
		}
		
		/* get repos */
		getUserRepos(function(user)
		{
			var repos = [];
			for(var i in user)
			{
				repos.push(user[i].name);
			}
			var result = {"issues":[]};
			var _sync = function()
			{
				/* all repo are fetched */
				if(repos.length==0)
				{
					if(result.issues.length>0)
					{
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
									return i1.tags[i] > i2.tags[i];
								}
							}
						});
					}
					return res.send(result);
				}
				
				var name = repos.shift();
				
				/* get issues */
				getRepoIssues(name, function(repo)
				{
					result.issues = result.issues.concat(repo);
					_sync();
				})
			}
			/* foreach repos get issues in synchrone mode */
			_sync();
		});
		
		
		
		
	});
	
    return api;
})();