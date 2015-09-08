module.exports = function(app) {
  app.use('/list/:group_id?', function(req, res) {
    console.log(req)
    var server = req.protocol+'://'+req.get('host')
    res.render('list', {
        group_id: req.params.group_id,
        server: server
      }
    );
  });
}
