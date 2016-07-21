name             'uhost-windows'
maintainer       'Mark C Allen'
maintainer_email 'mark@markcallen.com'
license          'All rights reserved'
description      'Installs/Configures uhost for windows'
long_description 'Installs/Configures uhost for windows'
version          '0.1.0'

%w{ windows }.each do |os|
  supports os
end

%w{ hostsfile chocolatey windows cygwin }.each do |cb|
  depends cb
end
