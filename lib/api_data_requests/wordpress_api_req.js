'use strict';

var request     = require('superagent');
var _           = require('lodash');
var signBuilder = require('../sign_builder.js');
var signType    = 'wordpress';
/*
  accessToken used for API requests to get more data
  Profile exists as an alternate to API request when info is adequate
  Module returns callback with error or Array of data
*/
module.exports = function getWordpressInfo(accessToken, wpProfile, callback) {

  // profile.user has the key sign data
  if(!wpProfile && !wpProfile._json) {
    console.log('Error: No profile info received.');
    return callback('No wordpress profile info received.', null);
  }
  var newSignData;
  var signsArray = [];

  // Base data OK. Get rest of data.
  request
    .get('https://public-api.wordpress.com/rest/v1.1/me/sites')
    .set('Authorization', ('BEARER ' + accessToken))
    .end(apiCallback);

  function apiCallback(err, res) {
    if(err) {
      console.log('Error getting signs info from Wordpress. Error: ', err);
      return callback( ('Wordpress Error: ' + err), null);
    }
    var sites = (res.body && res.body.sites ? res.body.sites : null);

    // Add data to the object
    var profileWithSites = _.cloneDeep(wpProfile);  // use this as a base object
    profileWithSites.sites = sites;

    // console.log("FINAL BUNCH OF MULTISIGN INFO WITH PRIMARY DATA IS: ", profileWithSites);
    return callback(null, profileWithSites);
  }
};

//// Example API Data (EXCLUDING Profile) - Array of Wordpress Signs
// [ { ID: 61259707,
//   name: 'Foundation Blocs',
//   description: 'Laying the foundation one bloc at a time.',
//   URL: 'https://clintonjnelson.wordpress.com',
//   user_can_manage: false,
//   capabilities:
//    { edit_pages: true,
//      edit_posts: true,
//      edit_others_posts: true,
//      edit_others_pages: true,
//      delete_posts: true,
//      delete_others_posts: true,
//      edit_theme_options: true,
//      edit_users: false,
//      list_users: true,
//      manage_categories: true,
//      manage_options: true,
//      activate_wordads: true,
//      promote_users: true,
//      publish_posts: true,
//      upload_files: true,
//      delete_users: false,
//      remove_users: true,
//      view_stats: true },
//   jetpack: false,
//   is_multisite: true,
//   post_count: 4,
//   subscribers_count: 1,
//   lang: 'en',
//   logo: { id: 0, sizes: [], url: '' },
//   visible: true,
//   is_private: false,
//   single_user_site: true,
//   is_vip: false,
//   is_following: false,
//   options:
//    { timezone: '',
//      gmt_offset: 0,
//      videopress_enabled: false,
//      upgraded_filetypes_enabled: false,
//      login_url: 'https://clintonjnelson.wordpress.com/wp-login.php',
//      admin_url: 'https://clintonjnelson.wordpress.com/wp-admin/',
//      is_mapped_domain: false,
//      is_redirect: false,
//      unmapped_url: 'https://clintonjnelson.wordpress.com',
//      featured_images_enabled: false,
//      theme_slug: 'pub/writr',
//      header_image: false,
//      background_color: '303030',
//      image_default_link_type: 'file',
//      image_thumbnail_width: 150,
//      image_thumbnail_height: 150,
//      image_thumbnail_crop: 0,
//      image_medium_width: 300,
//      image_medium_height: 300,
//      image_large_width: 1024,
//      image_large_height: 1024,
//      permalink_structure: '/%year%/%monthnum%/%day%/%postname%/',
//      post_formats: [],
//      default_post_format: '0',
//      default_category: 1,
//      allowed_file_types: [Object],
//      show_on_front: 'posts',
//      default_likes_enabled: true,
//      default_sharing_status: true,
//      default_comment_status: true,
//      default_ping_status: true,
//      software_version: '4.7.3',
//      created_at: '2013-12-04T06:22:08+00:00',
//      wordads: false,
//      publicize_permanently_disabled: false,
//      frame_nonce: '12a99d324d',
//      headstart: false,
//      headstart_is_fresh: false,
//      ak_vp_bundle_enabled: null,
//      advanced_seo_front_page_description: '',
//      advanced_seo_title_formats: [],
//      verification_services_codes: null,
//      podcasting_archive: null,
//      is_domain_only: false,
//      is_automated_transfer: false },
//   plan:
//    { product_id: 1,
//      product_slug: 'free_plan',
//      product_name_short: 'Free',
//      free_trial: false,
//      expired: false,
//      user_is_owner: false },
//   meta: { links: [Object] },
//   quota:
//    { space_allowed: 3221225472,
//      space_used: 0,
//      percent_used: 0,
//      space_available: 3221225472 } },
// { ID: 98113129,
//   name: 'testsitecjn',
//   description: '',
//   URL: 'https://testsitecjn.wordpress.com',
//   user_can_manage: false,
//   capabilities:
//    { edit_pages: true,
//      edit_posts: true,
//      edit_others_posts: true,
//      edit_others_pages: true,
//      delete_posts: true,
//      delete_others_posts: true,
//      edit_theme_options: true,
//      edit_users: false,
//      list_users: true,
//      manage_categories: true,
//      manage_options: true,
//      activate_wordads: true,
//      promote_users: true,
//      publish_posts: true,
//      upload_files: true,
//      delete_users: false,
//      remove_users: true,
//      view_stats: true },
//   jetpack: false,
//   is_multisite: true,
//   post_count: 1,
//   subscribers_count: 0,
//   lang: 'en',
//   logo: { id: 0, sizes: [], url: '' },
//   visible: true,
//   is_private: false,
//   single_user_site: true,
//   is_vip: false,
//   is_following: false,
//   options:
//    { timezone: '',
//      gmt_offset: 0,
//      videopress_enabled: false,
//      upgraded_filetypes_enabled: false,
//      login_url: 'https://testsitecjn.wordpress.com/wp-login.php',
//      admin_url: 'https://testsitecjn.wordpress.com/wp-admin/',
//      is_mapped_domain: false,
//      is_redirect: false,
//      unmapped_url: 'https://testsitecjn.wordpress.com',
//      featured_images_enabled: false,
//      theme_slug: 'pub/edin',
//      header_image: false,
//      background_color: false,
//      image_default_link_type: 'file',
//      image_thumbnail_width: 150,
//      image_thumbnail_height: 150,
//      image_thumbnail_crop: 0,
//      image_medium_width: 300,
//      image_medium_height: 300,
//      image_large_width: 1024,
//      image_large_height: 1024,
//      permalink_structure: '/%year%/%monthnum%/%day%/%postname%/',
//      post_formats: [],
//      default_post_format: '0',
//      default_category: 1,
//      allowed_file_types: [Object],
//      show_on_front: 'posts',
//      default_likes_enabled: true,
//      default_sharing_status: true,
//      default_comment_status: true,
//      default_ping_status: true,
//      software_version: '4.7.3',
//      created_at: '2015-08-24T20:30:15+00:00',
//      wordads: false,
//      publicize_permanently_disabled: false,
//      frame_nonce: '9dff8b5189',
//      headstart: false,
//      headstart_is_fresh: false,
//      ak_vp_bundle_enabled: null,
//      advanced_seo_front_page_description: '',
//      advanced_seo_title_formats: [],
//      verification_services_codes: null,
//      podcasting_archive: null,
//      is_domain_only: false,
//      is_automated_transfer: false },
//   plan:
//    { product_id: 1,
//      product_slug: 'free_plan',
//      product_name_short: 'Free',
//      free_trial: false,
//      expired: false,
//      user_is_owner: false },
//   meta: { links: [Object] },
//   quota:
//    { space_allowed: 3221225472,
//      space_used: 0,
//      percent_used: 0,
//      space_available: 3221225472 } } ]
