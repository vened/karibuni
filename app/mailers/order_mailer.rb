# encoding: utf-8
class OrderMailer < ActionMailer::Base

  default_url_options[:host] = "volare.su"

  default :from => "order@volare.su"

  def order_cofirm(order)
    @order = order
    mail(:to => "maxstbn@yandex.ru", :subject => "Поступил новый заказ на сайте volare.su")
  end

  def order_cofirm_user(order)
    @order = order
    mail(:to => @order.email , :subject => "Заказ на сайте volare.su")
  end

end