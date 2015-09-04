var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var path = require('path');

var app = module.exports = loopback();
var server = require('http').createServer(app);

app.middleware('initial', bodyParser.urlencoded({ extended: true }));
app.middleware('initial', bodyParser.json());

app.use(loopback.static(path.resolve(__dirname, '../client')));

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

app.post("/upload", function (req, res) {
  app.models.Photo.create(req.body,function(err, photo){
    if(err) {
      res.send("error::" +err)
    } else {
      res.status(200);
      res.send(photo);

      app.models.Photo.find(null,function(err, photos){
        app.io.emit('create', photos);
      })
    }
  })
});

app.get("/list", function (req, res) {
  app.models.Photo.find(null,function(err, photos){
    res.status(200);
    res.send(photos);
  })
});



app.get("/view/:id", function (req, res) {
  var id = req.params['id'];
  app.models.Photo.findById(id,[],function(err, photo){
    if(err) {
      res.status(404).send('Not found');
    } else {
      console.log(photo)
      photo.views++
      photo.save()
      res.status(200);
      res.send(photo);
    }
  })
});

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module){
    app.io = require('socket.io')(app.start());
    app.io.on('connection', function (socket) {
      console.log('a user connected');
      socket.on('disconnect', function(){
        console.log('user disconnected');
      });
    });
  }

});
