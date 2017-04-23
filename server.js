'use strict';

var express  = require('express'        );
var fs       = require('fs'             );
var https    = require('https'          );
var mongoose = require('mongoose'       );
var passport = require('passport'       );
var session  = require('express-session');  // Oauth1 provider workaround
var app      = express();

// Routers
var authRouter   = new express.Router();
var oauthRouter  = new express.Router();
var searchRouter = new express.Router();
var signsRouter  = new express.Router();
var usersRouter  = new express.Router();

// TEMP ENVIRONMENT VARIABLE
process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'setThisVarInENV';

// Set mongoose connection
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1/signpost');

// Initialize passport middleware & configure with passport_strategy.js
app.use(session({secret: 'oauth1sucks', id: 'oauth', maxAge: null}));
app.use(passport.initialize());
app.use(passport.session());            // only for oauth1 to work


// Load passport with strategies
require('./lib/passport_strategies/basic.js'        )(passport);
require('./lib/passport_strategies/facebook.js'     )(passport);
require('./lib/passport_strategies/foursquare.js'   )(passport);
require('./lib/passport_strategies/github.js'       )(passport);
require('./lib/passport_strategies/google.js'       )(passport);
require('./lib/passport_strategies/imgur.js'        )(passport);
require('./lib/passport_strategies/instagram.js'    )(passport);
require('./lib/passport_strategies/linkedin.js'     )(passport);
require('./lib/passport_strategies/pinterest.js'    )(passport);
require('./lib/passport_strategies/reddit.js'       )(passport);
require('./lib/passport_strategies/spotify.js'      )(passport);
require('./lib/passport_strategies/stackexchange.js')(passport);
require('./lib/passport_strategies/tumblr.js'       )(passport);
require('./lib/passport_strategies/twitter.js'      )(passport);
require('./lib/passport_strategies/wordpress.js'    )(passport);
require('./lib/passport_strategies/youtube.js'      )(passport);

// Populate Routes
require('./routes/oauth_routes.js')(oauthRouter, passport);
require('./routes/auth_routes.js' )(authRouter,  passport);
require('./routes/search_routes.js')(searchRouter);
require('./routes/signs_routes.js' )(signsRouter );
require('./routes/users_routes.js' )(usersRouter );

// Route middleware
app.use('/api', oauthRouter );
app.use('/api', authRouter  );
app.use('/api', searchRouter);
app.use('/api', signsRouter );
app.use('/api', usersRouter );

// Static Resources
var dir = process.env.WEBPACK_DIRECTORY || './client/dist';
app.use(express.static(__dirname + '/' + dir));

// This is so the UI doesn't get 404's for view URI's
// Returning index.html allows view to render each time
// This is called the PathLocationStrategy approach (vs having a # in the view path)
// This goes last, because all other paths should be caught by the routes
app.use('*/', function(req, res) {
  res.sendFile(__dirname + '/' + dir + '/index.html');
});

// SSL Cert
var sslOptions = { key: fs.readFileSync('key.pem'),
                   cert: fs.readFileSync('cert.pem'),
                   passphrase: process.env.SSL_CERT_PASSWORD };

// Start server
app.listen(process.env.PORT || 3000, function() {
  console.log('server running on port ' + (process.env.PORT || 3000));
});

https.createServer(sslOptions, app).listen(process.env.HTTPS_PORT || 4433, '127.0.0.1', function() {
  console.log("https server running on port " + (process.env.HTTPS_PORT || 4433));
});

