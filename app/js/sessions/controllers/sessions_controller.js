'use strict';


module.exports = function(app) {
  app.controller('sessionsController', ['$scope', '$http', function($scope, $http) {
    $scope.title = "This should show up in the page";

    $scope.login = function(loginData) {
      // var authHeader = loginInfo ? {authorization: 'Basic ' + btoa(loginData.email + ':' + loginData.password)} : {};
      var authHeader = {authorization: 'Basic ' + btoa('unicorn@example.com:foobar')}; // btoa function encodes to base64
      console.log('SENDING AUTH!');

      $http.get('/login', {headers: authHeader})
        .success(function(data, status, headers, config) {
          console.log('Return Data is: ',           data   );
          console.log('It returns these headers: ', headers);
        })
        .error(function(err) {
          console.log('Error logging in: ', err);
        });
    };
  }]);
};