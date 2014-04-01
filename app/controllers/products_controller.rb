class ProductsController < ApplicationController

  def show
    @product = Product.find(params[:id])
    #@products = Product.where("id != #{@product.id}").order("RAND()").last(6) #mysql
    @products = Product.last(4)
    @images = @product.attachments
    @meta_title = @product.title
    @metakey = @product.metakey
    @metadesc = @product.metadesc
  end

end
