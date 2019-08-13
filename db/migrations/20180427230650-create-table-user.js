'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('users', {
      // Primary attributes
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true },
      eat:                 { type: Sequelize.STRING },
      email:               { type: Sequelize.STRING, unique: true, allowNull: false },
      password:            { type: Sequelize.STRING },
      prt:                 { type: Sequelize.STRING },
      prtexpiration:       { type: Sequelize.DATE },
      role:                { type: Sequelize.ENUM('ADMIN', 'USER'), allowNull: false },
      username:            { type: Sequelize.STRING, unique: true },
      phoneId:             { type: Sequelize.INTEGER, unique: true, field: 'phone_id' },
      profilePicUrl:       { type: Sequelize.STRING, allowNull: true, field: 'profile_pic_url' },
      defaultUserLocation: { type: Sequelize.INTEGER, field: 'default_user_location', allowNull: true },  // Points to the association, but location end of association can be pointed to new location & maintain default

      // Checks
      confirmed:           { type: Sequelize.STRING },
      status:              { type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'PENDING'), allowNull: false },
      termsconditions:     { type: Sequelize.BOOLEAN },

      // Timestamps
      createdAt:           { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt:           { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW, field: 'updated_at' },
    });
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  }
};
