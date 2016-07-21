#
# Cookbook Name:: uhost
# Recipe:: default
#
# Copyright (C) 2015 Mark C Allen
#
# All rights reserved - Do Not Redistribute
#
#

## TODO: get hostsfile to work with cloud or ec2
#include_recipe "uhost-windows::hostsfile"

include_recipe 'chocolatey'

include_recipe 'cygwin::default'

%w{googlechrome}.each do |pack|
  chocolatey pack
end

cygwin_package 'curl' do
    action :install
end
