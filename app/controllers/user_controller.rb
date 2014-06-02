class UserController < ApplicationController

  def start
    @user = User.first
    @product_1 = Product.first(1)

    UserMailer.user(@user, @product_1).deliver

    # User.find_each(:start => 1, :batch_size => 10) do |u|
    #   if u.send_email === 1 and u.delivered === 1
    #     u.update_attribute(:send_email, 2222)
    #     UserMailer.user(u, @product_1).deliver
    #   end
    # end
  end

  def unsubscribe
    @user = User.find(params[:id])
    @user.update_attribute(:delivered, "0")
  end

end
