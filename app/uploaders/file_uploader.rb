# encoding: utf-8

class FileUploader < CarrierWave::Uploader::Base

  #include CarrierWave::RMagick
  include CarrierWave::MiniMagick

  storage :file

  def store_dir
    "upload/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  version :mini do
    process :resize_to_fill => [100, 80]
  end

  version :thumb do
    process :resize_to_fill => [214, 170]
  end

  version :promo do
    process :resize_to_fill => [298, 203]
  end

  version :large do
    process :resize_to_fit => [490, 540]
  end

end