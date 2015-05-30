name             'uhost'
maintainer       'Mark C Allen'
maintainer_email 'mark@markcallen.com'
license          'All rights reserved'
description      'Installs/Configures uhost'
long_description 'Installs/Configures uhost'
version          '0.1.0'

%w{ ubuntu }.each do |os|
  supports os
end

%w{ route53 hostsfile }.each do |cb|
  depends cb
end
