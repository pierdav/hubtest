var expect  = require("chai").expect;
var request = require("request");

var url = "http://localhost:8711/api/issues/pierdav/hubtest";
var counter = 0;
function _run(done)
{ 
	function _request()
	{
		counter++;
		request(url, function(error, response, body) {
		expect(response.statusCode).to.equal(200);
		console.log("request "+counter+" receive "+response.statusCode+" status code");
		if(counter < 70)
		{
			setTimeout(function(){_request();},1000*50);
		}
		else
		{
			done();
		}
		
	  });
	}
	_request();
	  
	
}

	
describe("Github API issues", function() {
  describe("We should be able to make more than 60 requests per hour.", function() {
	this.timeout(1000*60*60);
	before(function (done) {
		_run(done);
	});
	it("Request done "+counter+" times", function(done) {
		done();
	});
  });


});