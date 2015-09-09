var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var path = require('path');

var app = module.exports = loopback();
var server = require('http').createServer(app);

app.middleware('initial', bodyParser.urlencoded({ extended: true }));
app.middleware('initial', bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

app.post("/upload/:id?", function (req, res) {
  app.models.Photo.upsert(req.body,function(err, photo){
    if(err) {
      res.send("error::" +err)
    } else {

      console.log(photo)

      res.status(200);
      res.send(photo);

      emit_photos(photo.group_id)
      emit_photos("updates")
      emit_photos()
    }
  })
});

app.get("/view/:id", function (req, res) {
  var id = req.params['id'];
  app.models.Photo.findById(id,[],function(err, photo){
    if(err) {
      res.status(404).send('Not found');
    } else {
      photo.views++
      photo.save()
      emit_photos("updates")
      res.status(200);
      res.send(photo);
    }
  })
});

emit_photos = function(group_id){
  var channel = 'create'
  if(group_id == "updates"){
    criteria = {where:{updated:true}}
    channel = 'updates'
  }else if(group_id){
    criteria = {where:{group_id:group_id}}
    channel = 'create'+group_id
  }else{
    criteria = null
  }
  app.models.Photo.find(criteria,function(err, photos){
    app.io.emit(channel, photos);
  })
}

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module){
    app.io = require('socket.io')(app.start());
    app.io.on('connection', function (socket) {
      socket.on('listen', function(obj){
        emit_photos(obj.group_id)
      });
      socket.on('disconnect', function(){
        console.log('user disconnected');
      });
    });
  }

});
