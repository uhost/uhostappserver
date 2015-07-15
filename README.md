uhostappserver
===========

Install
-------

Install using UHostServer


Development
-----------


Install databases

sudo apt-get install mongodb
sudo apt-get install redis-server

Install chefDK

gem install bundler
bundle

Install grunt
npm install -g grunt-cli

Install packages
npm install

Run
grunt


Test
----

Run
grunt test

Individual tests
node_modules/mocha/bin/mocha test/routes/projectservice.js

clean the database

grunt cleandb

License & Authors
-----------------
- Author:: Mark Allen (mark@markcallen.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

