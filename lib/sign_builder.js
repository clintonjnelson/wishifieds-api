'use strict';
// This compiles all of the build types into one builder object
// Uses the "oauth_sign_mappers and loads them into the builder by name"

var builder = {};


// Load Build Types
require('./sign_builder_mapping/custom_sign_mapper.js'        )(builder);   // Custom
require('./sign_builder_mapping/deviantart_sign_mapper.js'    )(builder);
require('./sign_builder_mapping/disqus_sign_mapper.js'        )(builder);
require('./sign_builder_mapping/etsy_sign_mapper.js'          )(builder);
require('./sign_builder_mapping/facebook_sign_mapper.js'      )(builder);
require('./sign_builder_mapping/foursquare_sign_mapper.js'    )(builder);
require('./sign_builder_mapping/github_sign_mapper.js'        )(builder);
require('./sign_builder_mapping/google_sign_mapper.js'        )(builder);
require('./sign_builder_mapping/imgur_sign_mapper.js'         )(builder);
require('./sign_builder_mapping/instagram_sign_mapper.js'     )(builder);
require('./sign_builder_mapping/linkedin_sign_mapper.js'      )(builder);
require('./sign_builder_mapping/pinterest_sign_mapper.js'     )(builder);
require('./sign_builder_mapping/reddit_sign_mapper.js'        )(builder);
require('./sign_builder_mapping/spotify_sign_mapper.js'       )(builder);
require('./sign_builder_mapping/stackexchange_sign_mapper.js' )(builder);
require('./sign_builder_mapping/tumblr_sign_mapper.js'        )(builder);
require('./sign_builder_mapping/twitter_sign_mapper.js'       )(builder);
require('./sign_builder_mapping/vimeo_sign_mapper.js'         )(builder);
require('./sign_builder_mapping/vk_sign_mapper.js'            )(builder);
require('./sign_builder_mapping/wordpress_sign_mapper.js'     )(builder);
require('./sign_builder_mapping/youtube_sign_mapper.js'       )(builder);



// export the builder library
module.exports = builder;




