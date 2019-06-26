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


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE INDEX idx_messages_sender_id ON public.messages (sender_id);
      CREATE INDEX idx_messages_recipient_id ON public.messages (recipient_id);
      CREATE INDEX idx_messages_listing_id ON public.messages (listing_id);

      CREATE INDEX idx_users_phone_id ON public.users (phone_id);
      CREATE INDEX idx_users_default_user_location ON public.users (default_user_location);

      CREATE INDEX idx_listings_user_location_id ON public.listings (user_location_id);
      CREATE INDEX idx_listings_user_id ON public.listings (user_id);

      CREATE INDEX idx_images_listing_id ON public.images (listing_id);
      CREATE INDEX idx_images_user_id ON public.images (user_id);

      CREATE INDEX idx_favorites_listing_id ON public.favorites (listing_id);
      CREATE INDEX idx_favorites_user_id ON public.favorites (user_id);

      CREATE INDEX idx_users_locations_user_id ON public.users_locations (user_id);
      CREATE INDEX idx_users_locations_location_id ON public.users_locations (location_id);

      CREATE INDEX idx_listings_tags_listing_id ON public.listings_tags (listing_id);
      CREATE INDEX idx_listings_tags_tag_id ON public.listings_tags (tag_id);
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP INDEX idx_messages_sender_id;
      DROP INDEX idx_messages_recipient_id;
      DROP INDEX idx_messages_listing_id;
      DROP INDEX idx_users_phone_id;
      DROP INDEX idx_users_default_user_location;
      DROP INDEX idx_listings_user_location_id;
      DROP INDEX idx_listings_user_id;
      DROP INDEX idx_images_listing_id;
      DROP INDEX idx_images_user_id;
      DROP INDEX idx_favorites_listing_id;
      DROP INDEX idx_favorites_user_id;
      DROP INDEX idx_users_locations_user_id;
      DROP INDEX idx_users_locations_location_id;
      DROP INDEX idx_listings_tags_listing_id;
      DROP INDEX idx_listings_tags_tag_id;
    `);
  }
};
