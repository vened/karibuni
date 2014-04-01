class ProductsOrder < ActiveRecord::Base
  attr_accessible :product_id, :order_id, :size, :sum
  belongs_to :product
  belongs_to :order
end
