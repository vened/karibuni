# encoding: utf-8
class Page < ActiveRecord::Base
  acts_as_nested_set
  attr_accessible :title, :text, :meta_key, :meta_desc, :meta_title, :path, :parent_id


  validates :title, :length => {:minimum => 1}
  validates :path,
            :uniqueness => true,
            :length => {:minimum => 1},
            :format => {:with => /\A[a-zA-Z0-9\-]+\z/, :message => "Допускается только латиница и/или цифры"}

  include TheSortableTree::Scopes

  def parent_path
    self_and_ancestors.pluck(:path).join("/")
  end

  def to_param
    "#{parent_path}"
  end

end
