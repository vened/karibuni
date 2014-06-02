# encoding: utf-8
class UserMailer < ActionMailer::Base

  default_url_options[:host] = "karibuni.ru"

  default :from => "sales@karibuni.ru"

  def user(user, product_1)
    @user = user
    @product_1 = product_1
    #mail(:to => 'maxstbn@yandex.ru', :subject => "Новогодняя распродажа, специально для Вас!")
    # mail(:to => 'maxstbn@yandex.ru', :subject => "Новогодняя распродажа, специально для Вас!")
    mail(:to => 'maxst3@mail.ru', :subject => "Добро пожаловать, Максим!")
    # mail(:to => @user.email, :subject => "Летняя распродажа одежды, #{@user.name}, специально для Вас!")
  end

end