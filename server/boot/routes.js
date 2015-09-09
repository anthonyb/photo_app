module.exports = function(app) {
  app.use('/list/:group_id?', function(req, res) {
    var server = req.protocol+'://'+req.get('host')
    res.render('list', {
        group_id: req.params.group_id,
        server: server
      }
    );
  });
  app.use('/updates', function(req, res) {
    var server = req.protocol+'://'+req.get('host')
    res.render('updates', {
        group_id: 'updates',
        server: server
      }
    );
  });
}
