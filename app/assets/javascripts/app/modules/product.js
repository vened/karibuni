//modal initialisation
$(document).ready(function () {
    var modalInit = {
        modalClass: "vip",
        modalWidth: 900
    };
    var layer = Modal(modalInit);
    var productTemplate = JST['products/show']();

    function OpenProduct() {
        layer.show();
        var $content = $(".vip .modal-in").html(productTemplate);
        angular.bootstrap($content, ['modal', 'ProductModule']);
        layer.resize();
    }

    $('.js-product-view').on('click', function () {
        OpenProduct();
    });

});


//angular module
(function () {
    "use strict";

    angular.module('ProductModule', []).
        // controllers
        controller('ProductCtrl', ['$scope', function ProductCtrl($scope) {

            $scope.cc = function () {


                $http.get('/ajax/product/6.json')
                console.log()
                console.log("asdc")
            };

        }]).


        // services
        factory('ProductService', ['Resource', function (Resource) {
            return Resource('/ajax/product/6')
        }]);

}());