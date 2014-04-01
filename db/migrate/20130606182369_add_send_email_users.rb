class AddSendEmailUsers < ActiveRecord::Migration
  def change
    add_column :users, :send_email, :integer, :default => 1
  end
end