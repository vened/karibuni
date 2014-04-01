class CreateCategories < ActiveRecord::Migration
  def change
    create_table :categories do |t|
      t.string :title
      t.text :description
      t.integer :sortable

      t.string :path

      t.integer :parent_id
      t.integer :lft
      t.integer :rgt
      t.integer :depth # this is optional.


      t.timestamps
    end
    add_index :categories, :path
    add_index :categories, :parent_id
    add_index :categories, :lft
    add_index :categories, :rgt
  end
end
