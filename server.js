// Require the Express Module
var express = require('express');
var mongoose = require('mongoose');

// Create an Express App
var app = express();
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));

// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/basic_mongoose');

var QuoteSchema = new mongoose.Schema({
 name: String,
 content: String,
 date: { type: Date, default: Date.now }, 
 likes: { type: Number, default: 0 }
}, {timestamps: true} )
mongoose.model('Quote', QuoteSchema); 
var Quote = mongoose.model('Quote');

// Use native promises
mongoose.Promise = global.Promise;


// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');


app.get('/', function(req, res) {
  res.render('index')
})

app.get('/quotes', function(req, res) {
  Quote.find({}, function(err, quotes){
    function sortbylikes(a, b){
      if (a.likes < b.likes)
        return 1;
      if (a.likes > b.likes)
        return -1;
      return 0;
    }
    var quotes = quotes.sort(sortbylikes);
    res.render('quotes', {quotes})
  })
})

app.post('/quotes', function(req, res) {
  console.log("POST DATA", req.body);

  var quote = new Quote({
    name: req.body.name, content: req.body.content
  });
  quote.save(function(err) {
    if(err) {
      console.log('something went wrong');
    } else { 
      console.log('successfully added a quote!');
      res.redirect('/quotes');
    }
  })
})

app.get('/upvote/:id', function(req, res){
  Quote.findOne({_id: req.params.id}, function(err, quote){
    quote.likes++;
    quote.save(function(err) {
      if(err) {
        console.log('something went wrong');
      } else { 
        console.log('successfully upvoted a quote!');
        res.redirect('/quotes');
      }
    })
  })
})




app.get('/quotes/edit/:id', function(req, res) {  
  Quote.findOne({_id: req.params.id}, function(err, quote){
    res.render('edit', {quote})
  })
})

app.post('/quotes/destroy/:id', function(req, res) {
  console.log("POST DATA", req.body);
  // ...delete 1 record by a certain key/vaue.
  Quote.remove({_id: req.params.id}, function(err){
   // This code will run when the DB has attempted to remove all matching records to {_id: 'insert record unique id here'}
   if(err) {
      console.log('something went wrong');
    } else { 
      console.log('successfully removed a quote!');
      res.redirect('/');
    }
  })
})

app.post('/quotes/:id', function(req, res) {
  console.log("POST DATA", req.body);
  Quote.findOne({_id: req.params.id}, function(err, quote){
    console.log("quote", quote);
    quote.name = req.body.name || quote.name;
    quote.age = req.body.age || quote.age;
    mongoose.save(function(err) {
      if(err) {
        console.log('something went wrong');
      } else { 
        console.log('successfully edited a quote!');
        res.redirect('/');
      }
    })
  })
})











// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})