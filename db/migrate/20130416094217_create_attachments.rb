class CreateAttachments < ActiveRecord::Migration
  def change
    create_table :attachments do |t|
      t.string :file
      t.references :product

      t.timestamps
    end
    add_index :attachments, :product_id
  end
end
