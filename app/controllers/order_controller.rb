class OrderController < ApplicationController


  def order_add_product

    if session[:order_id]
      @order = Order.find(session[:order_id])
      @order_id = @order.id
    else
      @order = Order.new
      @order.save(:validate => false)
      @order_id = @order.id
      session[:order_id] = @order_id
    end


    @products_order = ProductsOrder.where("product_id = ? AND order_id = ?", params[:id], @order_id).first

    #общая стоимость заказа
    @product = Product.find(params[:id])
    
    #обновим счётчик для данного продукта
    @product.update_attribute(:hit, @product.hit + 1) 
    
    @order.update_attribute(:price, @order.price.to_i + @product.price.to_i)
    @order.update_attribute(:confirm, "В процессе")

    if @products_order
      @products_order.update_attributes(:order_id => @order_id, :product_id => params[:id], :size => params[:size], :sum => @products_order.sum + 1)
    else
      @products_order = ProductsOrder.new(:order_id => @order_id, :product_id => params[:id], :size => params[:size], :sum => 1)
      @products_order.save
    end


    @quantity = 0
    for product in @order.products
      @products_orders = ProductsOrder.where("product_id = ? AND order_id = ?", product.id, @order_id).first
      @count = @products_orders.sum
      @quantity = @quantity + @count
    end

    respond_to do |format|
      format.html { redirect_to cart_path(@order) }
      #format.js {}
      format.json { render :json => @order, :status => :created, :location => @order }
    end

  end


  def products_order_destroy
    @order = Order.find(params[:id])
    @product = Product.find(params[:product_id])

    #общая стоимость заказа
    @products_order = ProductsOrder.where("product_id = ? AND order_id = ?", params[:product_id], params[:id]).first
    @count = @order.price.to_i - @product.price.to_i * @products_order.sum
    @order.update_attribute(:price, @count)

    @order.products.delete(@product)

    respond_to do |format|
      format.html { redirect_to cart_url(@order) }
      format.json { head :no_content }
    end
  end


  def cart
    if session[:order_id]
      @order = Order.find(session[:order_id])
    else
      @order = Order.new
      @order.save(:validate => false)
      session[:order_id] = @order.id
    end
    @order_id = @order.id
    @products = @order.products

    @price = @order.price

    @meta_title = "Корзина"
  end

  def confirm
    @order = Order.find(params[:id])

    @order_id = params[:id]
    @products = @order.products
    @price = @order.price
  end


  def create
    @order = Order.find(params[:id])
    if @order.update_attributes(params[:order])
      session[:order_id] = nil
      redirect_to :action => :show, :id => @order.id
      OrderMailer.order_cofirm(@order).deliver
      OrderMailer.order_cofirm_user(@order).deliver
    else
      render :action => :confirm
    end
  end

  def show
    @order = Order.find(params[:id])
    @order_id = @order.id
    @products = @order.products
    @price = @order.price
  end

end
