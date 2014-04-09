
var g = require('../');

g.createServer({
  type: 'tcp',
  reactors: [
    function (socket) {
      socket
        .pipe(new g.console())
    }
  ]
}).listen(1337);
