#
# Cookbook Name:: uhost
# Recipe:: default
#
# Copyright (C) 2015 YOUR_NAME
#
# All rights reserved - Do Not Redistribute
#

include_recipe "uhost::route53"

bash "configure-hostname" do
  code <<-EOH
    /bin/hostname -F /etc/hostname
  EOH
  action :nothing
end

file "/etc/hostname" do
  content node["servername"]
  notifies :run, "bash[configure-hostname]", :immediately
end

hostsfile_entry node["cloud"]["local_ipv4"] do
  hostname  node["servername"]
  action    :append
end