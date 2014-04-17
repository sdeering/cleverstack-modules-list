Cleverstack Modules List
========================

Backend for listing modules for use with CleverStack.

* Modules List Backend: http://cleverstack-modules-list.herokuapp.com/
* Modules List Frontend: http://cleverstack.io/modules/




# Setup
Run the following commands to get it up and running.

```
Git clone git@github.com:sdeering/cleverstack-modules-list.git
cd cleverstack-modules-list
npm i
GITHUB_CLIENT_ID=xxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxx
node server
```

*Running locally* run `node server` and go to `http://localhost/8011`.

# Deployment
If you want to use authenticated GitHub requests you'll need to set some ENV variables `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Ie - If your deploying on Heroku use the following cmd. 

```
heroku config:set GITHUB_CLIENT_ID=<key> GITHUB_CLIENT_SECRET=<key>
```
