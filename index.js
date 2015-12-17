try{
  // Retrieve
  	var url = 'mongodb://localhost:27017/gps';
	var fs = require("fs");
	var http = require("http");
	var url = require("url");

  	var util = require('util');
	var logFile = fs.createWriteStream('ets.log', { flags: 'w' });
	var logStdout = process.stdout;
	var date = new Date();
	console.log = function () {
	  logFile.write(util.format.apply(null, arguments) + '\n');
	  logStdout.write(util.format.apply(null, arguments) + '\n');
	}
	console.error = console.log;
	  var MongoClient = require('mongodb').MongoClient;
	  var collection;
	  // Connect to the db
	  MongoClient.connect("mongodb://localhost:27017/gps", function(err, db) {
	    if(err) { return console.dir(err); }

	    collection = db.collection('coordinates');
	    


	  });
	  
	  http.createServer(function (request, response) {

	      var pathname = url.parse(request.url).pathname;
	      console.log("Request for " + pathname + " received.");

	      response.writeHead(200);

	      if(pathname == "/") {
	          html = fs.readFileSync("index.html", "utf8");
	          response.write(html);
	           response.end();
	      } else if (pathname == "/jquery.js") {
	          script = fs.readFileSync("jquery.js", "utf8");
	          response.write(script);
	           response.end();
	      }else if (pathname == "/get") {
	      	  var jsonObject = {};
	      	  try{
	  		  collection.find({}).sort({timestamp:-1}).limit(1).toArray(function(err, docs) {
	  		  	//console.log(docs);
	  		  	var item = docs[0];
	  		  	    if(item == null){
	  		  	    	console.log("No data found in db ,  returning default value");
	  		  	    	item = {latitude:17.454403, longitude:78.398674,timestamp:"default jsonObject"};
	  		  	    }else{
	  		  	    	item.timestamp= new Date(item.timestamp).toString();
	  		  	    	//console.log(item.timestamp); 
	  		  	    	console.log("Sending Data: {latitude:%s,longitude:%s,timestamp:%s}",item.latitude,item.longitude,item.timestamp);
	  		  	    }	  		    	
	  		    	response.end(JSON.stringify(item));  
	  		    });
	          
	          }
	          catch(e){
	          	 console.log("Exception: "+e);
	          }
	      }else if (pathname == "/save") {

	      	 var parsedUrl = url.parse(request.url, true);
			 var queryAsObject = parsedUrl.query;
			 console.log(JSON.stringify(queryAsObject));
			 try{
				 var document = {latitude:queryAsObject.la, longitude:queryAsObject.lg,timestamp:new Date()};
				 collection.insert(document, {w: 1}, function(err, records){
				})
			}catch(e){
				console.log("Exception while inserting data to collection "+e+" ---> "+JSON.stringify(queryAsObject));
			}
			 response.end("ok");
	      }


	     
	  }).listen(8888);

	  console.log("Listening to server on 8888...");

	}catch(e){

	  console.log("Exception: "+e);
	}
