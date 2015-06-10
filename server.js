var app = require('./server-config.js');

var port;

if (process.env.NODE_ENV === 'production') {
  port = process.env.PORT;
} else {
  port = 4568;
}

console.log(process.env.NODE_ENV);

app.listen(port);

console.log('Server now listening on port ' + port);
