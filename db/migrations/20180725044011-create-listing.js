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
      categoryId:  { type: Sequelize.INTEGER, allowNull: false, field: 'category_id' },
      conditionId: { type: Sequelize.INTEGER, allowNull: false, field: 'condition_id' },
      title:       { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
      price:       { type: Sequelize.STRING, allowNull: false },
      linkUrl:     { type: Sequelize.STRING, field: 'linkUrl' },  // FIXME!!! to understore in DB
      keywords:    { type: Sequelize.STRING },
      // imagesRef:   { type: Sequelize.STRING, field: 'images_ref' },
      heroImg:     { type: Sequelize.STRING, allowNull: false, field: 'hero_img'},
      userlocationId:{ type: Sequelize.INTEGER, allowNull: false, field: 'user_location_id' },
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
