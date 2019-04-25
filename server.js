'use strict';

var express     = require('express'        );
var compression = require('compression'    );
var fs          = require('fs'             );
var https       = require('https'          );
var passport    = require('passport'       );
var ensureHttps = require('./lib/routes_middleware/ensure_https.js');
var app         = express();
var helmet      = require('helmet');
var models      = require('./db/models/index.js');

// Routers
var authRouter  = new express.Router();
var usersRouter = new express.Router();
var tasksRouter = new express.Router();
var imagesRouter = new express.Router();
var listingsRouter = new express.Router();
var messagesRouter = new express.Router();
var favoritesRouter = new express.Router();
var conditionsRouter = new express.Router();
var categoriesRouter = new express.Router();

// Redirect any http to https
app.use(ensureHttps);

// Security middleware (https://expressjs.com/en/advanced/best-practice-security.html)
app.use(helmet());

// gzip the files for speed
app.use(compression());

// Initialize passport middleware & configure with passport_strategy.js
app.use(passport.initialize());
app.use(passport.session());            // only for oauth1 to work

// Load passport with strategies
require('./lib/passport_strategies/basic.js')(passport);

// Populate Routes
require('./routes/auth_routes.js' )(authRouter,  passport);
require('./routes/users_routes.js')(usersRouter );
require('./routes/tasks_routes.js')(tasksRouter );
require('./routes/images_routes.js')(imagesRouter);
require('./routes/listings_routes.js')(listingsRouter);
require('./routes/messages_routes.js')(messagesRouter);
require('./routes/favorites_routes.js')(favoritesRouter);
require('./routes/categories_routes.js')(categoriesRouter );
require('./routes/conditions_routes.js')(conditionsRouter );

// Add /api prefix to routes
app.use('/api', authRouter  );
app.use('/api', usersRouter );
app.use('/api', tasksRouter );
app.use('/api', imagesRouter);
app.use('/api', listingsRouter);
app.use('/api', messagesRouter);
app.use('/api', favoritesRouter);
app.use('/api', categoriesRouter);
app.use('/api', conditionsRouter);

// Static Resources
var dir = process.env.WEBPACK_DIRECTORY || './ui/dist';
app.use(express.static(__dirname + '/' + dir));

// This is so the UI doesn't get 404's for view URI's
// Returning index.html allows view to render each time
// This is called the PathLocationStrategy approach (vs having a # in the view path)
// This goes last, because all other paths should be caught by the routes
app.use('*/', function(req, res) {
  res.sendFile(__dirname + '/' + dir + '/index.html');
});

// if(process.env.NODE_ENV === 'production') { app.use(compression());}

// SSL Cert for Dev env
var sslOptions;
if(process.env.NODE_ENV === 'dev') {
  sslOptions = { key:  fs.readFileSync('key.pem'),
                 cert: fs.readFileSync('cert.pem'),
                 passphrase: process.env.SSL_CERT_PASSWORD };
}


// Set Postgres DB Connection
models.sequelize.sync()
  .then(function() {
    // DB connection success => start server
    app.listen(process.env.PORT || process.env.HTTP_PORT || 3000, function() {
      console.log('server running on port ' + (process.env.PORT || process.env.HTTP_PORT || 3000));
    });

    if(process.env.NODE_ENV === 'dev') {
      https.createServer(sslOptions, app).listen(process.env.HTTPS_PORT || 8443, '127.0.0.1', function() {
        console.log("https server running on port " + (process.env.HTTPS_PORT ||  8443));
      });
    }
  });



