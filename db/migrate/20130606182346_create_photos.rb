class CreatePhotos < ActiveRecord::Migration
  def change
    create_table :photos do |t|
      t.string :file
      t.references :news

      t.timestamps
    end
    add_index :photos, :news_id
  end
end
