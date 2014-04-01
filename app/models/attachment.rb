class Attachment < ActiveRecord::Base
  attr_accessible :file

  mount_uploader :file, FileUploader

  belongs_to :product

end
