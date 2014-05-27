Karibuni::Application.routes.draw do

  root :to => 'pages#index'

  #рассылка
  #get '/user_s' => 'user#start'
  #get '/user_unsubscribe/:id' => 'user#unsubscribe', :as => :unsubscribe
  #рассылка


  #начало роуты для корзины и заказов
  post 'order_add_product' => 'order#order_add_product'
  delete '/products_order_destroy/:id/:product_id' => 'order#products_order_destroy', :as => :products_order_destroy
  #get '/ajax/mini_cart' => 'ajax#mini_cart'
  get 'cart' => 'order#cart', :as => :cart
  get '/order/confirm/:id' => 'order#confirm', :as => :order_confirm
  put 'order/create/:id' => 'order#create'
  get 'order/:id' => 'order#show'
  #конец роуты для корзины и заказов


  resources :feedbacks, :only => [:index, :create]

  #begin ajax
  #get '/ajax/product/:id' => 'ajax#product'
  #end ajax


  get '/admin' => 'admin/dashboard#index'


  ActiveAdmin.routes(self)

  devise_for :admin_users, ActiveAdmin::Devise.config

  namespace :admin do
    resources :pages do
      collection do

        post :rebuild

        get ':id/edit' => 'pages#edit'
        get '*section/:id/edit' => 'pages#edit'

        get ':id' => 'pages#show'
        get '*section/:id' => 'pages#show'

        get ':id' => 'pages#new'

        put '*section/:id' => 'pages#update'
        put ':id' => 'pages#update'

        delete ':id' => 'pages#destroy'
        delete '*section/:id' => 'pages#destroy'

      end
    end
  end

  #begin хаки для страниц из-за ёбнутейшего роутинга ниже
  #get '/:id' => 'pages#show'
  #end хаки для страниц из-за ёбнутейшего роутинга ниже


  resources :categories, :only => [], :path => '/shop' do
    get 'product/:id' => 'products#show', :as => :product
  end
  resources :categories, :only => [], :path => '/shop/*section' do
    get 'product/:id' => 'products#show', :as => :product
  end


  get '/shop/' => 'categories#index', :as => :shop
  get '/shop/sales' => 'categories#sales', :as => :shop_sales
  get '/shop/:cat_id/product' => 'categories#category', :as => :category
  get '/shop/*section/:cat_id/product' => 'categories#category', :as => :category
  

  resources :pages, :path => "/", :only => [:index, :show]

end
