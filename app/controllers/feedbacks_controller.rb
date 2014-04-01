class FeedbacksController < ApplicationController

  def index
    @feedbacks = Feedback.all
    @feedback = Feedback.new
    @meta_title = "Обратная связь"
  end

  def create
    @feedbacks = Feedback.all
    @feedback = Feedback.new(params[:feedback])
    if @feedback.save
      redirect_to feedbacks_url, :notice => "Ваш отзыв успешно отправлен"
      FeedbackMailer.feedback_site(@feedback).deliver
    else
      render :action => 'index'
    end
  end

end
