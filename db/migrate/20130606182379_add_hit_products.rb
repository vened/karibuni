class AddHitProducts < ActiveRecord::Migration
  def change
    add_column :products, :hit, :integer, :default => 1
  end
end