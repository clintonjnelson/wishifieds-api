'use strict';

// NOT ACTUALLY USING THIS, IT GOT CONSOLIDATED TO BASE BUT SERVES AS AN EXAMPLE NOW
module.exports = {
  up: (queryInterface, Sequelize) => {
    // queryInterface.addColumn(
    //   'users',
    //   'profile_pic_url',
    //   {
    //     type: Sequelize.STRING,
    //     allowNull: true,  // DO WE REALLY WANT THIS TO BE ALLOWED NULL?
    //   }
    // );
  },

  down: (queryInterface, Sequelize) => {
    // queryInterface.removeColumn('users', 'profile_pic_url');
  }
};
