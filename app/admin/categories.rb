# encoding: utf-8
ActiveAdmin.register Category do

  config.sort_order = "sortable_asc"

  menu :label => "Категории продуктов"


  action_item :only => :show do
    link_to "New Category", new_admin_category_path
  end

  index do
    column "Название", :title
    #column "Описание", :description
    column "URL", :parent_path
    column "Сортировка", :sortable
    actions
  end


  form do |f|
    f.inputs "Создание/редактирование Категории" do
      f.input :title, :label => "Название"
      #f.input :description, :label => "Описание"
      f.input :path, :label => "URL"
      f.input :sortable, :as => :hidden, :input_html => {:value => 1}
      #f.input :sortable, :as => :hidden, :input_html => {:name => 'category[sortable_old]'}
      #f.input :sortable, :label => "Сортировка", :as => :select, :collection => Hash[Category.order("sortable ASC").map { |b| [b.title, b.sortable] }], :include_blank => false
      if f.object.new_record?
        f.input :sortable, :label => "Сортировка", :input_html => {:value => 1}
      else
        f.input :sortable, :label => "Сортировка"
      end

      f.input :parent_id, :as => :select, :label => "Родительская категория", :collection => nested_set_options(Category, @category) { |i| "#{'-' * i.level} #{i.title}" }

    end
    f.buttons
  end

  controller do

    def show
      @category = Category.find_by_path(params[:id])
    end

    def edit
      @category = Category.find_by_path(params[:id])
    end

    def new
      @category = Category.new
    end

    def create
      @category = Category.new(params[:category])
      if @category.save
        redirect_to admin_categories_url, notice: 'Категория успешно созданна'
      else
        render :new
      end
    end

    def update
      @category = Category.find_by_path(params[:id])
      #@categories = Category.where("sortable >= #{params[:category][:sortable]} AND sortable < #{params[:category][:sortable_old]}")
      #@categories.each do |cat|
      #  cat.update_attribute('sortable', cat.sortable + 1)
      #end
      if @category.update_attributes(params[:category])
        redirect_to admin_categories_url, notice: 'Категория успешно обновлена'
      else
        render :action => 'edit'
      end
    end

    def destroy
      @category = Category.find_by_path(params[:id])
      @category.destroy
      flash[:alert] = "Категория успешно удалена"
      redirect_to admin_categories_url
    end

  end

end
