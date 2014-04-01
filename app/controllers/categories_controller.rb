class CategoriesController < ApplicationController

  def index
    @categories = Category.order("sortable ASC")
    @products = Product.order("updated_at DESC, created_at DESC")
    @meta_title = "Магазин"
  end

  def category
    @category = Category.find_by_path(params[:cat_id])
    @products = Product.where("category_id = #{@category.id}").order("updated_at DESC")
    @meta_title = @category.title
  end

end
