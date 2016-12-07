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



var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
 name: {type: String, required: true, minlength: 4 }, 
 text: {type: String, required: true, minlength: 6 }, 
 comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true });

var CommentSchema = new mongoose.Schema({
 _message: {type: Schema.Types.ObjectId, ref: 'Message'},
 name: {type: String, required: true, minlength: 4 },
 text: {type: String, required: true, minlength: 6 }
}, {timestamp: true });

mongoose.model('Message', MessageSchema);
mongoose.model('Comment', CommentSchema);

var Message = mongoose.model('Message');
var Comment = mongoose.model('Comment');


// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');


app.get('/', function(req, res) {
  Message.find({})
  .populate('comments')
  .exec(function(err, messages){
    res.render('index', {messages})
  })
})


app.post('/messages', function(req, res) {
  console.log("POST DATA", req.body);

  var message = new Message({
    name: req.body.name, text: req.body.text
  });


  message.save(function(err) {
    if(err) {
      console.log('something went wrong', err);
      res.render('errors', {errors: err});
    } else { 
      console.log('successfully added a message!');
      res.redirect('/');
    }
  })
})

app.post('/messages/:id', function (req, res){
  Message.findOne({_id: req.params.id}, function(err, message){
   var comment = new Comment(req.body);
   comment._message = message._id;
   message.comments.push(comment);
   comment.save(function(err){
     message.save(function(err){
       if(err) { console.log('Error'); } 
       else { res.redirect('/'); }
     });
   });
 });
});




// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
  console.log("listening on port 8000");
})