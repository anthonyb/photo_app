module.exports = function(Photo) {
  Photo.observe('before save', function updateStatus(ctx, next) {
    if (ctx.instance) {
      if (ctx.isNewInstance != true){
        ctx.instance.updated = true
      }
    }else {
      ctx.data.updated = true
    }
    next();
  });
}
