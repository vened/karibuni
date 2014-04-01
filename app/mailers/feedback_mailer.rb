# encoding: utf-8
class FeedbackMailer < ActionMailer::Base

  default_url_options[:host] = "shikocc.ru"

  default :from => "order@shikocc.ru"

  def feedback_site(feedback)
    @feedback = feedback
    mail(:to => "maxstbn@yandex.ru", :subject => "Поступил новый отзыв на сайте www.shikocc.ru")
  end

end