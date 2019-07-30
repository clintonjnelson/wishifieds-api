'use strict';

// Example Call:
// SELECT * FROM find_listings_within_distance_city_statecode_v1('shoe'::VARCHAR, 'Seattle'::VARCHAR, 'WA'::VARCHAR, '100'::INTEGER);



module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION find_listings_within_distance_city_statecode_v1(search_str_p VARCHAR, city_p VARCHAR, statecode_p VARCHAR, distance_miles_p INTEGER)
      RETURNS table(
        listingId INTEGER,
        userId INTEGER,
        username VARCHAR,
        title VARCHAR,
        description TEXT,
        linkUrl TEXT,
        price VARCHAR,
        locationId INTEGER,
        images VARCHAR[],
        tags TEXT[],
        heroImg TEXT,
        slug VARCHAR,
        geoinfo DOUBLE PRECISION[],
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
          l.link_url AS linkUrl,
          l.price,
          l.location_id AS locationId,
          (SELECT ARRAY_AGG(i.url ORDER BY i.position ASC)
            FROM public.images AS i
            WHERE i.listing_id = l.id
            AND i.status = 'ACTIVE'::enum_images_status
            AND i.url IS NOT NULL
          ) AS images,
          (SELECT array_agg(ARRAY[t.id::text, t.name::text])
            FROM "tags" as t
            join listings_tags as lt on tag_id = t.id
              WHERE lt.listing_id = 6) AS tags,
          l.hero_img AS heroImg,
          l.slug,
          (SELECT Array[ST_Y(loc.geography::geometry), ST_X(loc.geography::geometry)]) as geoinfo,
          l.created_at AS createdAt,
          l.updated_at AS updatedAt
        FROM public.listings AS l
        JOIN public.users AS u ON u.id = l.user_id
        JOIN public.locations AS loc ON loc.id = l.location_id
        JOIN public.images AS img ON img.listing_id = l.id
        -- Location filter first, because that will quickly limit results. Postal match OR within radius centroid postal.
        WHERE (
          (loc.city = city_p AND loc.state_code = statecode_p)
          OR ST_DWITHIN(
            loc.geography::geography,  -- geography point
            (SELECT geography FROM public.locations WHERE city = city_p AND state_code = statecode_p LIMIT 1)::geography,  -- geography point
            (1609.344 * distance_miles_p)::float8  -- distance from miles to meters
          )
        )
        -- Search query next, because case-insensitive text partial match searching is slower
        AND (
          -- FIXME: IMPROVE PERFORMANCE USING lower(%search_string_p%) vs ILIKE
          l.title ILIKE CONCAT('%', search_str_p, '%')
          OR l.description ILIKE CONCAT('%', search_str_p, '%')
        )
        AND l.status = 'ACTIVE';
      $$ LANGUAGE sql
      SECURITY DEFINER
      COST 10;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP FUNCTION find_listings_within_distance_city_statecode_v1(character varying, character varying, character varying, integer);
    `);
  }
};
