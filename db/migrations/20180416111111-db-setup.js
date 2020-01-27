'use strict';


// ONLY gets ACTIVE listings
module.exports = {
  up: (queryInterface, Sequelize) => {
    // return queryInterface.sequelize.query(`
    //   CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
    // `);
  },

  down: (queryInterface, Sequelize) => {}
};
