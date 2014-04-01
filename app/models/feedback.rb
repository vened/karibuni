class Feedback < ActiveRecord::Base
  attr_accessible :text, :username, :email


  validates_length_of :username, :in => 2..50, :message => "Имя должно быть длинной не менее 2 и не более 50 символов"
  validates_length_of :text, :in => 2..5000, :message => "Отзыв должен быть длинной не менее 2 символов"
  validates :email, :format => {:with => /[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+([A-Za-z0-9]{2,4}|museum)/,
                                :message => "Не правильно указан адрес e-mail"}

end
