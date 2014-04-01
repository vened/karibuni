class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :email
      t.string :name
      t.string :gender
      t.integer :delivered
      t.datetime :unsubscribe
      t.datetime :sent
      t.datetime :view
      t.datetime :hit
    end
  end
end