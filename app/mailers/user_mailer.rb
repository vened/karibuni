# encoding: utf-8
class UserMailer < ActionMailer::Base

  default_url_options[:host] = "karibuni.ru"

  default :from => "sales@karibuni.ru"

  def user(user, product_1, product_2, product_3, product_4)
    @user = user
    @product_1 = product_1
    @product_2 = product_2
    @product_3 = product_3
    @product_4 = product_4
    #mail(:to => 'maxstbn@yandex.ru', :subject => "Новогодняя распродажа, специально для Вас!")
    #mail(:to => 'maxstbn@yandex.ru', :subject => "Новогодняя распродажа, специально для Вас!")
    mail(:to => 'maxst3@mail.ru', :subject => "Новогодняя распродажа, специально для Вас!")
    #mail(:to => @user.email, :subject => "Новогодняя распродажа, #{@user.name}, специально для Вас!")
  end

end