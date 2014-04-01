class PagesController < ApplicationController
  include PagesHelper

  def index
    #@products = Product.where("home_show = 0").order("updated_at DESC")
    @products = Product.first(4)
    @products_hit = Product.order('hit DESC').first(3)
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
