class CartCell < Cell::Rails

  def show
    if session[:order_id]
      @order = Order.find(session[:order_id])
      @order_id = @order.id
      @quantity = 0
      for product in @order.products
        @products_order = ProductsOrder.where("product_id = ? AND order_id = ?", product.id, @order_id).first
        @count = @products_order.sum
        @quantity = @quantity + @count
      end
    end
    render
  end

  def mini_cart
    if session[:order_id]
      if Order.exists?(session[:order_id])
        @order = Order.find(session[:order_id])
        @order_id = @order.id
        @products = @order.products
        @price = @order.price
      else
        @products = {}
      end
    else
      @products = {}
    end
    render
  end

  private

end
