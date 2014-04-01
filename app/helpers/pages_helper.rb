# encoding: utf-8
module PagesHelper

  def title
    base_title = "Карибуни - Магазин доступной экзотики &quot;Карибуни&quot;"
    if @meta_title.nil?
      base_title
    else
      "#{@meta_title} | #{base_title}"
    end
  end

  def metakey
    base_meta_key = "доступная экзотика, экзотика, эксклюзивные товары, сувениры, этника, этнические сувениры"
    if @metakey.nil?
      base_meta_key
    else
      @metakey
    end
  end

  def metadesc
    base_meta_desc = "магазин экзотических товаров"
    if @metadesc.nil?
      base_meta_desc
    else
      @metadesc
    end
  end

end
