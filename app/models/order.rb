# encoding: utf-8
class Order < ActiveRecord::Base

  attr_accessible :username, :surname, :email, :phone, :address, :comment, :data,
                  :price, :payment, :order_confirm, :confirm

  attr_reader :items
  #
  validates_length_of :username, :in => 2..50, :message => "Имя должно быть длинной не менее 2 и не более 50 символов"
  validates :email, :format => {:with => /[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+([A-Za-z0-9]{2,4}|museum)/,
                                :message => "Не правильно указан адрес e-mail"}
  validates_length_of :phone, :in => 5..15, :message => "Не указан телефон"
  validates_length_of :address, :in => 5..300, :message => "Не указан адрес"

  #begin объявлеям связь с упражнениями многие ко многим, через соединительную модель motions_programs
  has_many :products_orders
  has_many :products, :through => :products_orders
  #end объявлеям связь с упражнениями многие ко многим, через соединительную модель motions_programs

end
