// Example Call:
// SELECT * FROM location_typeahead_postal_v1('98101', 10);

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION location_typeahead_postal_v1(p_postal VARCHAR, p_limit INTEGER)
      RETURNS table(
        id INTEGER,
        city VARCHAR,
        stateCode VARCHAR,
        postal VARCHAR,
        typeahead VARCHAR
      )
      AS $$
        SELECT DISTINCT ON(loc.postal) --FIX THIS! GETTING DUPS ON SOMETHING, but DISTINCT IS SLOW.
          loc.id,
          loc.city,
          loc.state_code AS stateCode,
          loc.postal,
          loc.postal AS typeahead
        FROM public.locations AS loc
        WHERE loc.postal LIKE (p_postal || '%')
        ORDER BY loc.postal ASC
        LIMIT COALESCE(p_limit, 10);
      $$
      LANGUAGE sql
      SECURITY DEFINER
      COST 10;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP FUNCTION location_typeahead_postal_v1(character varying, integer);
    `);
  }
};
