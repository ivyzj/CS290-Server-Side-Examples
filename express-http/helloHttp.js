var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var credentials = require('./credentials.js');
var request = require('request');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
app.use(express.static('public'));

// We have added a next argument to our get call here. Calling this 
// will call the next function in the chain of matching handlers. 
// In general we are not going to worry about it. The exception is 
// if we call next(err), that is, we pass it an error argument. If we 
// do that it will call that last function in our list of handlers 
// that has 4 arguments. The one specifically for handling errors.
app.get('/',function(req,res,next){
  var context = {};
  request('http://api.openweathermap.org/data/2.5/weather?q=corvallis&APPID=' + credentials.owmKey, function(err, response, body){
    if(!err && response.statusCode < 400){
      context.owm = body;
      request({
        "url":"http://httpbin.org/post",
        "method":"POST",
        "headers":{
          "Content-Type":"application/json"
        },
        "body":'{"foo":"bar","number":1}'
      }, function(err, response, body){
        if(!err && response.statusCode < 400){
          context.httpbin = body;
          res.render('home',context);
          // The other critical thing here is that we now call render from within the callback 
          // passed to request. This is absolutely critical. 
          // If we called res.render from the end of the app.get callback, it will render the page well before 
          // we get the information back from our request. So we need to wait till the request is done. We will 
          // know it is done when it calls its callback so we can safely make the call to render from within there.
        }else{
          console.log(err);
          if(response){
            console.log(response.statusCode);
          }
          next(err);
        }
      });
    } else {
      console.log(err);
      if(response){
        console.log(response.statusCode);
      }
      next(err);
    }
  });
});

app.get('/get-ex',function(req,res,next){
  var context = {};
  request('http://api.openweathermap.org/data/2.5/weather?q=corvallis&APPID=' + credentials.owmKey, function(err, response, body){
    if(!err && response.statusCode < 400){
      context.owm = body;
      res.render('home',context);
    } else {
      if(response){
        console.log(response.statusCode);
      }
      next(err);
    }
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
