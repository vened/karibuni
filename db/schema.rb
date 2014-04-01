# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20140317181334) do

  create_table "active_admin_comments", :force => true do |t|
    t.string   "resource_id",   :null => false
    t.string   "resource_type", :null => false
    t.integer  "author_id"
    t.string   "author_type"
    t.text     "body"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
    t.string   "namespace"
  end

  add_index "active_admin_comments", ["author_type", "author_id"], :name => "index_active_admin_comments_on_author_type_and_author_id"
  add_index "active_admin_comments", ["namespace"], :name => "index_active_admin_comments_on_namespace"
  add_index "active_admin_comments", ["resource_type", "resource_id"], :name => "index_admin_notes_on_resource_type_and_resource_id"

  create_table "admin_users", :force => true do |t|
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
  end

  add_index "admin_users", ["email"], :name => "index_admin_users_on_email", :unique => true
  add_index "admin_users", ["reset_password_token"], :name => "index_admin_users_on_reset_password_token", :unique => true

  create_table "attachments", :force => true do |t|
    t.string   "file"
    t.integer  "product_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "attachments", ["product_id"], :name => "index_attachments_on_product_id"

  create_table "categories", :force => true do |t|
    t.string   "title"
    t.text     "description"
    t.integer  "sortable"
    t.string   "path"
    t.integer  "parent_id"
    t.integer  "lft"
    t.integer  "rgt"
    t.integer  "depth"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "categories", ["lft"], :name => "index_categories_on_lft"
  add_index "categories", ["parent_id"], :name => "index_categories_on_parent_id"
  add_index "categories", ["path"], :name => "index_categories_on_path"
  add_index "categories", ["rgt"], :name => "index_categories_on_rgt"

  create_table "feedbacks", :force => true do |t|
    t.string   "username"
    t.string   "email"
    t.text     "text"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "news", :force => true do |t|
    t.string   "title"
    t.text     "desc"
    t.string   "meta_key"
    t.string   "meta_desc"
    t.string   "path"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "news", ["path"], :name => "index_news_on_path"
  add_index "news", ["title"], :name => "index_news_on_title"

  create_table "orders", :force => true do |t|
    t.string   "username"
    t.string   "surname"
    t.string   "email"
    t.string   "phone"
    t.string   "address"
    t.string   "confirm"
    t.string   "payment"
    t.text     "comment"
    t.text     "data"
    t.decimal  "price"
    t.boolean  "order_confirm"
    t.boolean  "payment_method"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
  end

  create_table "pages", :force => true do |t|
    t.string   "title"
    t.text     "text"
    t.string   "meta_title"
    t.string   "meta_key"
    t.string   "meta_desc"
    t.string   "path"
    t.integer  "parent_id"
    t.integer  "lft"
    t.integer  "rgt"
    t.integer  "depth"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "photos", :force => true do |t|
    t.string   "file"
    t.integer  "news_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "photos", ["news_id"], :name => "index_photos_on_news_id"

  create_table "products", :force => true do |t|
    t.string   "title"
    t.text     "desc"
    t.string   "metakey"
    t.string   "metadesc"
    t.decimal  "price"
    t.decimal  "weight"
    t.integer  "category_id"
    t.boolean  "home_show"
    t.boolean  "new"
    t.decimal  "sale"
    t.decimal  "price_sale"
    t.datetime "created_at",                 :null => false
    t.datetime "updated_at",                 :null => false
    t.integer  "hit",         :default => 1
  end

  create_table "products_orders", :force => true do |t|
    t.integer "product_id"
    t.integer "order_id"
    t.integer "size"
    t.integer "sum"
  end

  add_index "products_orders", ["id"], :name => "index_products_orders_on_id"
  add_index "products_orders", ["order_id"], :name => "index_products_orders_on_order_id"
  add_index "products_orders", ["product_id"], :name => "index_products_orders_on_product_id"

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "users", :force => true do |t|
    t.string   "email"
    t.string   "name"
    t.string   "gender"
    t.integer  "delivered"
    t.datetime "unsubscribe"
    t.datetime "sent"
    t.datetime "view"
    t.datetime "hit"
    t.integer  "send_email",  :default => 1
  end

end
