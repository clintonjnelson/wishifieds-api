// Example Call:
// SELECT * FROM location_typeahead_citystate_v1('Seattle', 'W', 10);

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION location_typeahead_citystate_v1(p_city VARCHAR, p_statecode VARCHAR, p_limit INTEGER)
      RETURNS table(
        id INTEGER,
        city VARCHAR,
        stateCode VARCHAR,
        postal VARCHAR,
        typeahead VARCHAR
      )
      AS $$
        SELECT DISTINCT ON(loc.city, loc.state_code) --FIX THIS! GETTING DUPS ON SOMETHING, but DISTINCT IS SLOW.
          loc.id,
          loc.city,
          loc.state_code AS stateCode,
          loc.postal,
          CONCAT(loc.city, ', ', loc.state_code) AS typeahead
        FROM public.locations AS loc
        WHERE loc.city iLIKE (p_city || '%')
        AND (
          (p_statecode IS NOT NULL AND loc.state_code iLIKE (p_statecode || '%'))
          OR p_statecode IS NULL
        )
        ORDER BY loc.city, loc.state_code ASC
        LIMIT COALESCE(p_limit, 10);
      $$
      LANGUAGE sql
      SECURITY DEFINER
      COST 10;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP FUNCTION location_typeahead_citystate_v1(character varying,character varying,integer);
    `);
  }
};
