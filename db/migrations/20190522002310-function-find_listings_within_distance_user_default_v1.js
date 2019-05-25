'use strict';

// Example Call
// SELECT * FROM find_listings_within_distance_user_default_v1('shoe'::VARCHAR, 4::INTEGER, 5::INTEGER);


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION find_listings_within_distance_user_default_v1(search_str_p VARCHAR, user_id_p INTEGER, distance_miles_p INTEGER)
      RETURNS table(
        listingId INTEGER,
        userId INTEGER,
        username VARCHAR,
        categoryId INTEGER,
        conditionId INTEGER,
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
          l.category_id AS categoryId,
          l.condition_id AS conditionId,
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
        -- Location filter first, because that will quickly limit results
        WHERE ST_DWITHIN(
          loc.geography::geography,  -- geography point
          (SELECT centerloc.geography
             FROM public.users AS searchuser
             JOIN public.users_locations AS centeruserloc ON centeruserloc.id = searchuser.default_user_location
             JOIN public.locations AS centerloc ON centerloc.id = centeruserloc.location_id
             WHERE searchuser.id = user_id_p)::geography,  -- geography point
          (1609.344 * distance_miles_p)::float8  -- distance from miles to meters
        )
        -- Search query next, because case-insensitive text partial match searching is slower
        AND (
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
      DROP FUNCTION (character varying,integer,integer);
    `);
  }
};
