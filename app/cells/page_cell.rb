class PageCell < Cell::Rails

  def menu
    @pages = Page.all
    render
  end

  def shop
    @categories = Category.roots
    render
  end
  
  private

end
