class Product < ActiveRecord::Base
  attr_accessible :desc, :metadesc, :metakey, :price, :title, :weight, :attachments_attributes,
                  :category_id, :home_show, :new, :sale, :price_sale, :hit


  has_many :attachments, :dependent => :destroy

  validates :title, :length => {:minimum => 1}

  #def to_param
  #  "#{path}"
  #end

  belongs_to :category

  #begin объявлеям связь с программами многие ко многим, через соединительную модель motions_programs
  has_many :products_orders
  has_many :orders, :through => :products_orders
  #end объявлеям связь с программами многие ко многим, через соединительную модель motions_programs


  accepts_nested_attributes_for :attachments, :allow_destroy => true


  before_update :product_sale

  def product_sale
    if self.sale > 0
      self.price_sale = self.price/100 * (100 - self.sale)
    end
  end


end
