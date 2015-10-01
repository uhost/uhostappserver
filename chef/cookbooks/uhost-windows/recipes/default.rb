#
# Cookbook Name:: uhost
# Recipe:: default
#
# Copyright (C) 2015 YOUR_NAME
#
# All rights reserved - Do Not Redistribute
#
#

include_recipe "uhost-windows::hostsfile"

include_recipe 'chocolatey'

%w{bash grep}.each do |pack|
  chocolatey pack do
    source 'cygwin'
  end
end


