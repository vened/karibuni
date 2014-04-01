# encoding: utf-8
ActiveAdmin.register Page do

  menu :label => "Статические страницы"

  config.batch_actions = false

  index do
    render "index"
  end

  show do
    render "show"
  end

  form do |f|
    f.inputs "Новая страница" do
      f.input :title, :label => "Заголовок страницы"
      f.input :text, :label => "Текст страницы"
      f.input :meta_title, :label => "SEO, Title"
      f.input :meta_key, :label => "SEO, ключевые слова"
      f.input :meta_desc, :label => "SEO, краткое описание"
      f.input :path, :label => "URL"
      f.input :parent_id, :as => :select, :label => "Родительская страница", :collection => nested_set_options(Page, @page) { |i| "#{'-' * i.level} #{i.title}" }
    end
    f.buttons
  end


  controller do

    def new
      @page = Page.new
    end

    def create
      @page = Page.new(params[:page])
      if @page.save
        redirect_to admin_pages_url, notice: 'страница успешно созданна'
      else
        render :new
      end
    end

    def rebuild
      id = params[:id].to_i
      parent_id = params[:parent_id].to_i
      prev_id = params[:prev_id].to_i
      next_id = params[:next_id].to_i


      render :text => "Do nothing" and return if parent_id.zero? && prev_id.zero? && next_id.zero?

      page = Page.find_by_id(id)

      if prev_id.zero? && next_id.zero?
        page.move_to_child_of Page.find(parent_id)
      elsif !prev_id.zero?
        page.move_to_right_of Page.find(prev_id)
      elsif !next_id.zero?
        page.move_to_left_of Page.find(next_id)
      end

      render(:nothing => true)
    end

    def edit
      @page = Page.find_by_path(params[:id])
    end

    def update
      @page = Page.find_by_path(params[:id])

      #закомментил Стасову сохранялку на диск
      #save_to_disk

      if @page.update_attributes(params[:page])
        redirect_to admin_page_url
        #render :action => 'show'
      else
        render :action => 'edit'
      end
    end

    def show
      @page = Page.find_by_path(params[:id])
      #@text_page = @page.text_pages
    end

    def destroy
      @page = Page.find_by_path(params[:id])

      @page.destroy
      #File.delete(Rails.root + "public/#{@page.path}.html")

      flash[:alert] = "Страница успешно удалена"
      redirect_to admin_pages_url
    end

    #закомментил Стасову сохранялку на диск
    #def save_to_disk
    #  @page = Page.find_by_path(params[:id])
    #  @rendered = render_to_string(@page.text, :template => 'pages/show.html.haml', :layout => 'application')
    #  #@rendered = Haml::Engine.new(@page.text).render
    #
    #
    #  File.open(Rails.root + "public/#{@page.path}.html", "w") do |f|
    #    f.write(@rendered)
    #    f.close()
    #  end
    #end

  end
end
