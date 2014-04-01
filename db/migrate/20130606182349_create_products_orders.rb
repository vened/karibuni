class CreateProductsOrders < ActiveRecord::Migration
  def change
    create_table :products_orders do |t|
      t.belongs_to :product
      t.belongs_to :order
      t.integer :size
      t.integer :sum
    end
    add_index :products_orders, :id
    add_index :products_orders, :product_id
    add_index :products_orders, :order_id
  end
end