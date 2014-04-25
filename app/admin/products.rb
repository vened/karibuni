# encoding: utf-8
ActiveAdmin.register Product do

  menu :label => "Товар"

  action_item :only => :show do
    link_to "New Product", new_admin_product_path
  end

  index do
    selectable_column
    column "Название", :title, :sortable => :title
    column "Описание", :desc, :sortable => false
    column "Фото", :attachments, :sortable => false do |product|
      render :partial => "index_photo", :object => product
    end
    column "Цена", :price, :sortable => :price
    #column "Размеры", :weight, :sortable => :weight
    column "Категория", :category, :sortable => :weight

    column "Новинка", :new
    column "Hit", :hit
    #column "Скидка", :sale
    #column "Цена со скидкой", :price_sale

    actions :defaults => true
  end

  form(:html => {:multipart => true}) do |f|
    f.inputs "Создание/редактирование продукта" do
      f.input :title, :label => "Название"
      f.input :desc, :label => "Описание"
      f.input :price, :label => "Цена"
      # f.input :weight, :label => "Размеры"
      f.input :new, :label => "Новинка"
      f.input :hit, :label => "Hit"
      #f.input :home_show, :label => "Показывать на главной"
      #f.input :sale, :label => "Скидка"
      #f.input :price_sale, :label => "Цена со скидкой"


      #f.input :metakey, :label => "Metakey"
      #f.input :metadesc, :label => "Metadesc"
      
      f.input :category, :as => :select, :label => "Категория", :collection => nested_set_options(Category, @category) { |i| "#{'-' * i.level} #{i.title}" }
      
      f.has_many :attachments, :through => Product do |s|
        s.input :file, :as => :file, :label => "Фото", :hint => s.object.file.nil? ? s.template.content_tag(:span, "Нет фото") : s.template.image_tag(s.object.file_url(:thumb))
        s.input :_destroy, :as => :boolean, :label => "Удалить"
      end
    end
    f.buttons
  end

  show do
    panel product.title do
      attributes_table_for product do
        row("Описание") { product.desc }
        row("Цена") { product.price }
        row("Размеры") { product.weight }
        row("Новинка") { product.new }
        #row("Показывать на главной") { product.home_show }
        #row("Скидка") { product.sale }
        #row("Цена со скидкой") { product.price_sale }

        #row("metakey") { product.metakey }
        #row("Metadesc") { product.metadesc }
        row("Категория") { product.category }
        product.attachments.each do |at|
          row ("Photo") { image_tag(at.file_url(:thumb)) }
        end
      end
    end
  end

  controller do

    def show
      @product = Product.find(params[:id])
    end

    def edit
      @product = Product.find(params[:id])
    end

    def create
      @product = Product.new(params[:product])
      if @product.save
        redirect_to admin_product_url(@product), :notice => 'Товар успешно создан'
      else
        render :new
      end
    end

    def update
      @product = Product.find(params[:id])
      if @product.update_attributes(params[:product])
        redirect_to admin_product_url(@product), :notice => "Товар успешно обновлен"
      else
        render :action => 'edit'
      end
    end

    def destroy
      @product = Product.find(params[:id])
      @product.destroy
      flash[:alert] = "Товар успешно удален"
      redirect_to admin_products_url
    end

  end

end
