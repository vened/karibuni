# encoding: utf-8
class Category < ActiveRecord::Base
  acts_as_nested_set
  attr_accessible :title, :description, :path, :total, :sortable, :sortable_old, :parent_id
  attr_accessor :sortable_old
  has_many :products

  validates :title, :length => {:minimum => 1}
  validates :path,
            :uniqueness => true,
            :length => {:minimum => 1},
            :format => {:with => /\A[a-zA-Z0-9\-]+\z/, :message => "Допускается только латиница и/или цифры"}


  def parent_path
    self_and_ancestors.pluck(:path).join("/")
  end


  def to_param
    "#{path}"
  end

end
