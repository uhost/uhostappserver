#
# Cookbook Name:: uhost
# Recipe:: route53.rb
#
# Copyright 2015, Mark C Allen Software Inc.
#
# All rights reserved - Do Not Redistribute
#

include_recipe "route53"

route53_record "create a dns entry " + node["servername"] do
  name node["servername"]
  value node["cloud"]["public_ipv4"]
  ttl 60
  type  "A"
  zone_id               node["aws"]["route53"]["hostedzoneid"]
  aws_access_key_id     node["aws"]["awsAccessKey"]
  aws_secret_access_key node["aws"]["awsSecretKey"]
  action :create
  overwrite true
end

hostsfile_entry node["cloud"]["public_ipv4"] do
  hostname  node["servername"]
  action    :append
end
