class CreateProducts < ActiveRecord::Migration
  def change
    create_table :products do |t|
      t.string :title
      t.text :desc
      t.string :metakey
      t.string :metadesc
      t.decimal :price, :scale => 2
      t.decimal :weight
      t.references :category
      t.boolean :home_show
      t.boolean :new
      t.decimal :sale
      t.decimal :price_sale

      t.timestamps
    end
  end
end
