var mongoose = require('mongoose');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var crypto = require('crypto');


if (process.env.NODE_ENV === 'production') {
  mongoose.connect(process.env.MONGOLAB_URI);
} else {
  mongoose.connect('mongodb://localhost/shortly');
}

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Yaaay!  Connection established.  Exciting!');
});

var linkSchema = mongoose.Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: {
    type: Number,
    default: 0
  }
});

var userSchema = mongoose.Schema({
  username: String,
  password: String
});

userSchema.methods.hashPassword = function(plaintext) {
  var cipher = Promise.promisify(bcrypt.hash);
  var context = this;
  return cipher(plaintext, null, null).bind(this)
    .then(function(hash) {
      context.password = hash;
    });
};

userSchema.methods.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

linkSchema.methods.shortenUrl = function() {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
};

var Link = mongoose.model('Link', linkSchema);
var User = mongoose.model('User', userSchema);

module.exports.Link = Link;
module.exports.User = User;

///////////////////////////////////////////////////
//GETTING STARTED TUTORIAL
// linksSchema.methods.shorten = function () {
//   this.url = this.url.substr(0, 5);
//   console.log('shortened url: ', this.url);
// }

// var Link = mongoose.model('Link', linksSchema);

// var link1 = new Link({url: 'http://www.google.com'});
// console.log('link1 url: ', link1.url);
// link1.shorten();

// link1.save(function (err, link1) {
//   if (err) return console.error(err);
//   console.log('link1 has been saved: ', link1.url);
// });

// Link.find( {url: /^h/ }, function (err, links) {
//   if (err) return console.error(err);
//   console.log(links);
// });
////////////////////////////////////////////////////

// var db = Bookshelf.initialize({
//   client: 'sqlite3',
//   connection: {
//     host: '127.0.0.1',
//     user: 'your_database_user',
//     password: 'password',
//     database: 'shortlydb',
//     charset: 'utf8',
//     filename: path.join(__dirname, '../db/shortly.sqlite')
//   }
// });

// db.knex.schema.hasTable('urls').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urls', function (link) {
//       link.increments('id').primary();
//       link.string('url', 255);
//       link.string('base_url', 255);
//       link.string('code', 100);
//       link.string('title', 255);
//       link.integer('visits');
//       link.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });


