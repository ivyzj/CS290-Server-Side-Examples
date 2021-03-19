var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var credentials = require('./credentials.js');
var request = require('request');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
// manage routes and store the display content
app.use(express.static('public'));

app.get('/',function(req,res){
  var context = {};
  // first make a get request
  request('http://api.openweathermap.org/data/2.5/weather?q=corvallis&APPID=' + credentials.owmKey, handleGet);

  function handleGet(err, response, body){
    if(!err && response.statusCode < 400){
      // here we have the get response
      context.owm = body;
      // after get response was recieved, make the post request
      request({
        "url":"http://httpbin.org/post",
        "method":"POST",
        "headers":{
          "Content-Type":"application/json"
        },
        "body":'{"foo":"bar","number":1}'  
        // We can always pass a string as the body of the POST, 
        // so we can convert things into strings and send that, as URL 
        // encoded form data (just like the format of things in the query
        // string in a GET request), as JSON or as some other data format.

        // Additionally, if you care to read about them, the request library 
        // can do some handy things to help with parsing form data or automatically 
        // converting objects into JSON strings.
      }, handlePost)
    } else {
      console.log(err);
      console.log(response.statusCode);
    }
  }

  function handlePost(err, response, body){
    if(!err && response.statusCode < 400){
      // here we get our post response
      context.httpbin = body;
      // after recieved both responses, render home page
      res.render('home',context);
    }else{
      console.log(err);
      console.log(response.statusCode);
    }
  }
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
