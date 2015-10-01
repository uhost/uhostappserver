#
# Cookbook Name:: uhost-windows
# Recipe:: hostsfile.rb
#
# Copyright 2015, Mark C Allen Software Inc.
#
# All rights reserved - Do Not Redistribute
#

hostsfile_entry node["cloud"]["public_ipv4"] do
  hostname  node["servername"]
  action    :append
end
