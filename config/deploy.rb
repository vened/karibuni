# настройка по руководству - http://istickz.ru/deploy-rails-app/
require "rvm/capistrano"
require "bundler/capistrano"

set :application, "karibuni"
set :shared_children, shared_children
set :repository, "git@github.com:vened/karibuni.git"
set :deploy_to, "/home/max/www/karibuni"
set :scm, :git
set :branch, "master"
set :user, "max"
set :group, "staff"
set :use_sudo, false
set :rails_env, "production"
set :deploy_via, :copy
set :ssh_options, {:forward_agent => true, :port => 22}
set :keep_releases, 5
default_run_options[:pty] = true
server "185.22.60.226", :app, :web, :db, :primary => true

after "deploy", "deploy:cleanup"

namespace :deploy do
  %w[start stop restart].each do |command|
    desc "#{command} unicorn server"
    task command, roles: :app, except: {no_release: true} do
      run "/etc/init.d/unicorn_#{application} #{command}"
    end
  end

  task :setup_config, roles: :app do
    sudo "ln -nfs #{current_path}/config/nginx.conf /etc/nginx/sites-enabled/#{application}"
    sudo "ln -nfs #{current_path}/config/unicorn_init.sh /etc/init.d/unicorn_#{application}"
    run "mkdir -p #{shared_path}/config"
    put File.read("config/database.yml"), "#{shared_path}/config/database.yml"
    puts "Теперь вы можете отредактировать файлы в  #{shared_path}."
  end
  after "deploy:setup", "deploy:setup_config"

  task :symlink_config, roles: :app do
    run "ln -nfs #{shared_path}/config/database.yml #{release_path}/config/database.yml"
  end
  after "deploy:finalize_update", "deploy:symlink_config"

  desc "Make sure local git is in sync with remote."
  task :check_revision, roles: :web do
    unless `git rev-parse HEAD` == `git rev-parse origin/master`
      puts "WARNING: HEAD is not the same as origin/master"
      puts "Run `git push` to sync changes."
      exit
    end
  end
  before "deploy", "deploy:check_revision"

end
