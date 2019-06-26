'use strict';

// Example Call:
// SELECT * FROM find_listings_any_distance_v1('shoe'::VARCHAR);



module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION find_listings_any_distance_v1(search_str_p VARCHAR)
      RETURNS table(
        listingId INTEGER,
        userId INTEGER,
        username VARCHAR,
        title VARCHAR,
        description TEXT,
        keywords VARCHAR,
        linkUrl TEXT,
        price VARCHAR,
        userLocationId INTEGER,
        images VARCHAR[],
        heroImg TEXT,
        slug VARCHAR,
        createdAt TIMESTAMP WITH TIME ZONE,
        updatedAt TIMESTAMP WITH TIME ZONE
      )
      AS $$
        SELECT DISTINCT ON (l.id)  --FIX THIS! GETTING DUPS ON SOMETHING, but DISTINCT IS SLOW.
          l.id AS listingId,
            l.user_id AS userId,
          u.username,
          l.title,
          l.description,
          l.keywords,
          l.link_url AS linkUrl,
          l.price,
          l.user_location_id AS userLocationId,
          (SELECT ARRAY_AGG(i.url ORDER BY i.position ASC)
            FROM public.images AS i
            WHERE i.listing_id = l.id
            AND i.status = 'ACTIVE'::enum_images_status
            AND i.url IS NOT NULL
          ) AS images,
          l.hero_img AS heroImg,
          l.slug,
          l.created_at AS createdAt,
          l.updated_at AS updatedAt
        FROM public.listings AS l
        JOIN public.users_locations AS ul ON ul.id = l.user_location_id
        JOIN public.users AS u ON u.id = ul.user_id
        JOIN public.locations AS loc ON loc.id = ul.location_id
        JOIN public.images AS img ON img.listing_id = l.id
        -- Search query next, because case-insensitive text partial match searching is slower
        WHERE (
          l.title ILIKE CONCAT('%', search_str_p, '%')
          OR l.description ILIKE CONCAT('%', search_str_p, '%')
        );
      $$ LANGUAGE sql
      SECURITY DEFINER
      COST 10;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP FUNCTION find_listings_any_distance_v1(character varying);
    `);
  }
};
