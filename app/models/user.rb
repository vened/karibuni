class User < ActiveRecord::Base
  attr_accessible :email, :name, :delivered, :send_email
end
