class CreateOrders < ActiveRecord::Migration
  def change
    create_table :orders do |t|
      t.string :username
      t.string :surname
      t.string :email
      t.string :phone
      t.string :address
      t.string :confirm
      t.string :payment
      t.text :comment
      t.text :data
      t.decimal :price
      t.boolean :order_confirm
      t.boolean :payment_method

      t.timestamps
    end
  end
end