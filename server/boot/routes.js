module.exports = function(app) {
  app.use('/list/:group_id?', function(req, res) {
    console.log(req.params.group_id)
    res.render('list', { group_id: req.params.group_id});
  });
}
