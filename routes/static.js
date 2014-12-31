module.exports = function(params) {
  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });

}
