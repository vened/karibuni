$(document).ready(function () {

    function SizeSelected() {
        var product = $(".js-product"),
            size = product.find(".js-weight"),
            OrderAdd = product.find(".js-order-add");

        size.on('click', function () {
            var curentCont = $(this).closest(".js-weight-cont");
            curentCont.find(".js-weight").removeClass("selected");
            $(this).addClass("selected");
            var curentSize = $(this).html();
            OrderAdd.data("size", curentSize);
        });

    }

    SizeSelected();


    function AddProductToCart() {

        var OrderAdd = $(".js-order-add");
        var cart = $(".js-mini_cart");

        OrderAdd.on('click', function (e) {
            var productId = $(this).data("id");
            var productSize = $(this).data("size");
            e.preventDefault();

            $.post("/order_add_product", { id: productId, size: productSize })
                .done(function () {
                    $.get('/ajax/mini_cart', function (data) {
                        cart.html(data);
                    });
                    window.location.replace('/cart');
                });

        });
    };

    AddProductToCart();

    function ProductImageView() {
        var image = $(".js-image img");
        var images = $(".js-images img");

        images.on('click', function () {
            var imgPath = $(this).data("img");
            image.attr('src', imgPath);
        });

    };

    ProductImageView();

});