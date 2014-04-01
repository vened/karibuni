# encoding: utf-8
class UserMailer < ActionMailer::Base

  default_url_options[:host] = "volare.su"

  default :from => "shop@volare.su"

  def user(user, product_1, product_2, product_3, product_4)
    @user = user
    @product_1 = product_1
    @product_2 = product_2
    @product_3 = product_3
    @product_4 = product_4
    attachments.inline['logo.png'] = File.read('/home/max/www/dev.gymh.ru/public/images/logo.png')
    attachments.inline['product_1.png'] = File.read("/home/max/www/volare.su/public#{@product_1.attachments.find_last.file_url(:thumb)}")
    attachments.inline['product_2.png'] = File.read("/home/max/www/volare.su/public#{@product_2.attachments.find_last.file_url(:thumb)}")
    attachments.inline['product_3.png'] = File.read("/home/max/www/volare.su/public#{@product_3.attachments.find_last.file_url(:thumb)}")
    attachments.inline['product_4.png'] = File.read("/home/max/www/volare.su/public#{@product_4.attachments.find_last.file_url(:thumb)}")
    mail(:to => @user.email, :subject => "Новогодняя распродажа, #{@user.name}, специально для Вас!")
  end

end