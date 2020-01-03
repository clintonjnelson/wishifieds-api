'use strict';

// This file populates the "db" object & exports it for use via require("db")

const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const basename  = path.basename(__filename);
const env       = process.env.NODE_ENV || 'development';
const config    = require(__dirname + '/../config/config.json')[env];  // Ingest the JSON & apparently creates an Object from it + extras
const db        = {};  // This will be populated


console.log("ENV IS ", env);
console.log("database IS ", config.database);
console.log("username IS ", config.username);
console.log("password IS ", config.password);
console.log("config IS ", config);

// Reads in environment variables
// const databaseName = process.env.DATABASE_NAME
// const username = process.env.DB_USERNAME
// const password = process.env.DB_PASSWORD

// TODO: FIX ENVIRONMENT VARIABLES ISSUES & ADD NOTES FOR GATCHAS
// Create new sequelize db connection based on config populates JS object
//const sequelize = config.use_env_variable ?
  // new Sequelize(process.env[config.use_env_variable], config) :
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Reads in all models files in current models folder, EXCEPT THIS file
// Create their tables & import them into sequelize as models
fs
  .readdirSync(__dirname)
  .filter(file => {  // All JS files on /models that are NOT system files & not THIS file
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {  // Import each model file & populate "db" wth models by name
    const model = sequelize['import'](path.join(__dirname, file));
    console.log("MODEL TO BE LOADED INTO DB IS: ", model);
    db[model.name] = model;
  });

// For each model, create db associations (???)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Models
//db.User.hasOne(db.Phone, {foreignKey: 'user_id'});
// db.Phone.belongsTo(db.User);  // Doesn't this do same thing as above?
db.User.hasMany(          db.Listing,      {foreignKey: 'user_id',     sourceKey: 'id'});
db.User.hasMany(          db.Badge,        {foreignKey: 'user_id',     sourceKey: 'id'});
db.Message.belongsTo(     db.Listing,      {foreignKey: 'listing_id',  sourceKey: 'id'});
db.Listing.hasMany(       db.Favorite,     {foreignKey: 'listing_id',  sourceKey: 'id'});
db.Listing.hasMany(       db.Message,      {foreignKey: 'listing_id',  sourceKey: 'id'});
db.Listing.belongsTo(     db.User,         {foreignKey: 'user_id',     targetKey: 'id'});
db.Badge.belongsTo(       db.User,         {foreignKey: 'user_id',     targetKey: 'id'});
db.Favorite.belongsTo(    db.User,         {foreignKey: 'user_id',     targetKey: 'id'});
db.Favorite.belongsTo(    db.Listing,      {foreignKey: 'listing_id',  targetKey: 'id'});
db.Message.belongsTo(     db.User,         {foreignKey: 'sender_id',   targetKey: 'id'});
db.Listing.hasMany(       db.Image,        {foreignKey: 'listing_id'});
// db.Listing.hasOne(        db.UserLocation, {foreignKey: 'user_listing_id', sourceKey: 'id'});

// Many-to-Many Relationships
db.UserLocation.belongsTo(   db.Location,  {foreignKey: 'location_id', targetKey: 'id'});
db.UserLocation.belongsTo(   db.User,      {foreignKey: 'user_id',     targetKey: 'id'});
db.Tag.belongsToMany(db.Listing, {through: 'listings_tags', foreignKey: 'tag_id'});
db.Listing.belongsToMany(db.Tag, {through: 'listings_tags', foreignKey: 'listing_id'});
// db.UserLocation.hasOne(   db.Location,     {foreignKey: 'id',          sourceKey: 'location_id'});
// db.UserLocation.hasOne(   db.User,         {foreignKey: 'id',          sourceKey: 'user_id'});
// db.User.belongsToMany(    db.Location,     {foreignKey: 'user_id',     through: 'users_locations'});
// db.Location.belongsToMany(db.User,         {foreignKey: 'location_id', through: 'users_locations'});

// db.Message.hasOne(db.User, {foreignKey: 'recipient_id', targetKey: 'id'});
// db.Category.hasMany(db.Listing);
// db.Category.hasMany(db.Condition);
// db.Condition.hasMany(db.Category);
// db.Condition.hasMany(db.Listing);
// db.Location.hasMany(db.Listing);
// db.Listing.belongsTo(db.Location);
// db.Image.belongsTo(db.Listing);

module.exports = db;
