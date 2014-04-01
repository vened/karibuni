# encoding: utf-8
ActiveAdmin.register Order do

  menu :label => "Заказы"
  config.batch_actions = false

  filter :payment_method, :label => "Форма оплаты"
  filter :confirm, :label => "Статус заказа", :as => :check_boxes, :collection => [['В обработке', 'В обработке'], ['Готово', 'Готово'], ['Отказ', 'Отказ'], ['Новый', 'Новый']]


  index do
    render "index"
  end

  show do
    render "show"
  end

  form :partial => "form"

end
