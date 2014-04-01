# encoding: utf-8

class PhotoUploader < CarrierWave::Uploader::Base

  #include CarrierWave::RMagick
  include CarrierWave::MiniMagick

  storage :file

  def store_dir
    "upload/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  version :mini do
    process :resize_to_fill => [90, 90]
  end

  version :thumb do
    process :resize_to_fill => [204, 184]
  end

  version :large do
    process :resize_to_fit => [600, 600]
  end

end