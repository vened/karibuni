class PagesController < ApplicationController
  include PagesHelper

  def index
    #@products = Product.where("new = 't'").first(4)
    @products = Product.where("new = 1").first(4)
    #@products = Product.first(4)
    @products_hit = Product.order('hit DESC').first(2)
    @max_sale = Product.maximum("sale")
    @products_sale = Product.where("sale = #{@max_sale}")
    # @products_sale = Product.where("sale > 0").order("RAND()").first(1)
    #@products = Product.where("id != #{@product.id}").order("RAND()").last(6) #mysql

  end

  def show
    @page = Page.find_by_path(params[:id])
    if @page.meta_title.nil?
      @meta_title = @page.title
    else
      @meta_title = @page.meta_title
    end
    @metakey = @page.meta_key
    @metadesc = @page.meta_desc
  end

end
