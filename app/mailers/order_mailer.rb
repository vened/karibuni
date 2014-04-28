# encoding: utf-8
class OrderMailer < ActionMailer::Base

  default_url_options[:host] = "http://karibuni.ru/"

  default :from => "order@karibuni.ru"

  def order_cofirm(order)
    @order = order
    mail(:to => "levunova@mail.ru", :subject => "Поступил новый заказ на сайте karibuni.ru")
  end

  def order_cofirm_user(order)
    @order = order
    mail(:to => @order.email , :subject => "Заказ на сайте karibuni.ru")
  end

end