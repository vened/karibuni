# encoding: utf-8
ActiveAdmin.register_page "Dashboard" do


  menu :priority => 1, :label => proc { I18n.t("active_admin.dashboard") }

  content :title => proc { I18n.t("active_admin.dashboard") } do

    # Here is an example of a simple dashboard with columns and panels.
    #
    columns do

      column do
        panel "Новые заказы" do
          @orders = Order.where("confirm = ?", 'Новый').order("created_at DESC")
          table do
            tr do
              th "№"
              th "Клиент"
              th "Телефон"
              th "Email"
              th "Стоимость(руб.)"
              th "Форма оплаты"
              th
            end
            @orders.each do |item|

              tr do
                td link_to item.id, admin_order_path(item)
                td item.username
                td item.phone
                td item.email
                td item.price.to_i
                td item.payment
              end

            end
          end
        end
      end
    end
  end # content
end
