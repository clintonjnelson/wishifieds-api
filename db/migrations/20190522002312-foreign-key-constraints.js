'use strict';

// Example Constraint Creation:
//    ALTER TABLE child_table ADD CONSTRAINT constraint_name FOREIGN KEY (c1) REFERENCES parent_table (p1);
// Naming format:
//    fk_<fk-tablename>_<fk-columnname>_<pk-tablename>_<pk-columnname>

// Overview:
//    messages: sender_id (user.id), recipient_id(user.id), listing_id(listing.id)
//    users: phone_id(phone.id), default_user_location(user_location.id)
//    listings: category_id(category.id), condition_id(condition.id), user_location_id(user_location.id), user_id(user.id)
//    images: listing_id(listing.id), user_id(user.id)
//    favorites: user_id(user.id), listing_id(listing.id)
//    users_locations: user_id(user.id), location_id(location.id)


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE public.messages ADD CONSTRAINT fk_messages_sender_id_users_id FOREIGN KEY (sender_id) REFERENCES public.users (id);
      ALTER TABLE public.messages ADD CONSTRAINT fk_messages_recipient_id_users_id FOREIGN KEY (recipient_id) REFERENCES public.users (id);
      ALTER TABLE public.messages ADD CONSTRAINT fk_messages_listing_id_listings_id FOREIGN KEY (listing_id) REFERENCES public.listings (id);

      ALTER TABLE public.users ADD CONSTRAINT fk_users_phone_id_users_id FOREIGN KEY (phone_id) REFERENCES public.phones (id);
      ALTER TABLE public.users ADD CONSTRAINT fk_users_default_user_location_users_locations_id FOREIGN KEY (default_user_location) REFERENCES public.users_locations (id);

      ALTER TABLE public.listings ADD CONSTRAINT fk_listings_category_id_categories_id FOREIGN KEY (category_id) REFERENCES public.categories (id);
      ALTER TABLE public.listings ADD CONSTRAINT fk_listings_condition_id_conditions_id FOREIGN KEY (condition_id) REFERENCES public.conditions (id);
      ALTER TABLE public.listings ADD CONSTRAINT fk_listings_user_location_id_users_locations_id FOREIGN KEY (user_location_id) REFERENCES public.users_locations (id);
      ALTER TABLE public.listings ADD CONSTRAINT fk_listings_user_id_users_id FOREIGN KEY (user_id) REFERENCES public.users (id);

      ALTER TABLE public.images ADD CONSTRAINT fk_images_listing_id_listings_id FOREIGN KEY (listing_id) REFERENCES public.listings (id);
      ALTER TABLE public.images ADD CONSTRAINT fk_images_user_id_users_id FOREIGN KEY (user_id) REFERENCES public.users (id);

      ALTER TABLE public.favorites ADD CONSTRAINT fk_favorites_listing_id_listings_id FOREIGN KEY (listing_id) REFERENCES public.listings (id);
      ALTER TABLE public.favorites ADD CONSTRAINT fk_favorites_user_id_users_id FOREIGN KEY (user_id) REFERENCES public.users (id);

      ALTER TABLE public.users_locations ADD CONSTRAINT fk_users_locations_user_id_users_id FOREIGN KEY (user_id) REFERENCES public.users (id);
      ALTER TABLE public.users_locations ADD CONSTRAINT fk_users_locations_location_id_locations_id FOREIGN KEY (location_id) REFERENCES public.locations (id);
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_messages_sender_id_users_id;
      ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_messages_recipient_id_users_id;
      ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_messages_listing_id_listings_id;

      ALTER TABLE public.users DROP CONSTRAINT IF EXISTS fk_users_phone_id_users_id;
      ALTER TABLE public.users DROP CONSTRAINT IF EXISTS fk_users_default_user_location_users_locations_id;

      ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS fk_listings_category_id_categories_id;
      ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS fk_listings_condition_id_conditions_id;
      ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS fk_listings_user_location_id_users_locations_id;
      ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS fk_listings_user_id_users_id;

      ALTER TABLE public.images DROP CONSTRAINT IF EXISTS fk_images_listing_id_listings_id;
      ALTER TABLE public.images DROP CONSTRAINT IF EXISTS fk_images_user_id_users_id;

      ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS fk_favorites_listing_id_listings_id;
      ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS fk_favorites_user_id_users_id;

      ALTER TABLE public.users_locations DROP CONSTRAINT IF EXISTS fk_users_locations_user_id_users_id;
      ALTER TABLE public.users_locations DROP CONSTRAINT IF EXISTS fk_users_locations_location_id_locations_id;
    `);
  }
};
