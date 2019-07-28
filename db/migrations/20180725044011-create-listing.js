'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('listings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title:       { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
      price:       { type: Sequelize.STRING, allowNull: false },
      linkUrl:     { type: Sequelize.STRING, field: 'link_url' },
      heroImg:     { type: Sequelize.STRING, allowNull: false, field: 'hero_img'},
      locationId:  { type: Sequelize.INTEGER, allowNull: false, field: 'location_id' },
      userId:      { type: Sequelize.INTEGER, allowNull: false, field: 'user_id' },
      slug:        { type: Sequelize.STRING, allowNull: false },
      status:      { type: Sequelize.ENUM('ACTIVE', 'PRIVATE', 'INACTIVE', 'DELETED'), allowNull: false},
      createdAt:   { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt:   { type: Sequelize.DATE, allowNull: false, field: 'updated_at' }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('listings');
  }
};
