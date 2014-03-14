# How I made first game in Phaser

## Finding a web server

To develop a game in Phaser, you must run a local server. As something of a Rubyist, I decided to use Ruby's WEBrick to serve my current directory. From the directory you wish to serve, issue the following command:

    ruby -run -e httpd . -p 9090

Your current directory will now be served from port 9090.
