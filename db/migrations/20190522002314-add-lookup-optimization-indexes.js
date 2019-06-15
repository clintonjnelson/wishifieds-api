'use strict';

// Example Index Creation:
//    CREATE UNIQUE INDEX idx_messages_sender_id ON public.messages (sender_id);
//    CREATE UNIQUE INDEX idx_<table>_<column> ON <table> (<column>);
// Naming format:
//    idx_<table>_<column>

// Overview:
//    messages: sender_id, recipient_id, listing_id
//    users: phone_id, default_user_location
//    listings: category_id, condition_id, user_location_id, user_id
//    images: listing_id, user_id
//    favorites: user_id, listing_id
//    users_locations: user_id, location_id

// TODO: NEED TO USE THE pg_trm with possible gin_trgm_ops
// THAT extension is a special indexing for long strings where it indexes the words.
// Great blog on niallburkley.com about this.


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      -- bulk text optimized searches
      CREATE INDEX trgm_idx_listings_title ON public.listings USING GiST(title gist_trgm_ops);
      CREATE INDEX trgm_idx_listings_description ON public.listings USING GiST(description gist_trgm_ops);
      CREATE INDEX trgm_idx_listings_keywords ON public.listings USING GiST(keywords gist_trgm_ops);

      -- Make postal code searches faster
      CREATE INDEX idx_locations_postal ON public.locations (postal);
      --  Uses a pluging to index the geography. HIGH cost to build, but if update rarely, then increases queries 3x.
      CREATE INDEX gpx_idx_locations_geography ON public.locations USING GiST(geography);

    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP INDEX idx_messages_sender_id;
      DROP INDEX idx_messages_recipient_id;
      DROP INDEX idx_messages_listing_id;
      DROP INDEX idx_users_phone_id;
      DROP INDEX idx_users_default_user_location;
      DROP INDEX idx_listings_category_id;
      DROP INDEX idx_listings_condition_id;
      DROP INDEX idx_listings_user_location_id;
      DROP INDEX idx_listings_user_id;
      DROP INDEX idx_images_listing_id;
      DROP INDEX idx_images_user_id;
      DROP INDEX idx_favorites_listing_id;
      DROP INDEX idx_favorites_user_id;
      DROP INDEX idx_users_locations_user_id;
      DROP INDEX idx_users_locations_location_id;
    `);
  }
};
