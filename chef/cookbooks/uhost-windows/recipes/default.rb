#
# Cookbook Name:: uhost
# Recipe:: default
#
# Copyright (C) 2015 YOUR_NAME
#
# All rights reserved - Do Not Redistribute
#
#

## TODO: get hostsfile to work with cloud or ec2
#include_recipe "uhost-windows::hostsfile"

include_recipe 'chocolatey'

%w{cygwin cyg-get googlechrome}.each do |pack|
  chocolatey pack
end

## TODO: Add cyg-get calls


