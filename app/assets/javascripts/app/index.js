//= require_tree ../../templates
//= require ../lib/angular
//= require ../lib/angular-resource
//= require ../lib/Modal
//= require ../app/modules/product


(function () {
    "use strict";

    var app = angular.module('modal', [
        'ProductModule'
    ]);

    app.
        config(['$interpolateProvider', function ($interpolateProvider) {
            $interpolateProvider
                .startSymbol('[[')
                .endSymbol(']]');
        }]);
}());
