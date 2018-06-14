## Open Source EtherSocial Mining Pool

![Miner's stats page](https://user-images.githubusercontent.com/7374093/31591180-43c72364-b236-11e7-8d47-726cd66b876a.png)

[![Join the chat at https://gitter.im/sammy007/open-ethereum-pool](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/sammy007/open-ethereum-pool?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/sammy007/open-ethereum-pool.svg?branch=develop)](https://travis-ci.org/sammy007/open-ethereum-pool) [![Go Report Card](https://goreportcard.com/badge/github.com/sammy007/open-ethereum-pool)](https://goreportcard.com/report/github.com/sammy007/open-ethereum-pool)

### Features  

**This pool is being further developed to provide an easy to use pool for EtherSocial miners. This software is functional however an optimised release of the pool is expected soon. Testing and bug submissions are welcome!**

* Support for HTTP and Stratum mining
* Detailed block stats with luck percentage and full reward
* Failover geth instances: geth high availability built in
* Modern beautiful Ember.js frontend
* Separate stats for workers: can highlight timed-out workers so miners can perform maintenance of rigs
* JSON-API for stats

#### Proxies

* [Ether-Proxy](https://github.com/sammy007/ether-proxy) HTTP proxy with web interface
* [Stratum Proxy](https://github.com/Atrides/eth-proxy) for EtherSocial

### Building on Linux

Dependencies:

  * go >= 1.9
  * redis-server >= 2.8.0
  * nodejs >= 4 LTS
  * nginx
  * gesn

**I highly recommend to use Ubuntu 16.04 LTS.**

### Install go lang

    $ sudo apt-get install -y build-essential
    $ wget https://redirector.gvt1.com/edgedl/go/go1.9.2.linux-amd64.tar.gz
    $ tar zxvf go1.9.2.linux-amd64.tar.gz 
    $ sudo mv go /usr/local

Type the command below.

    $ export GOROOT=/usr/local/go
    $ export PATH=$GOROOT/bin:$PATH

For relogin, type the same command at the bottom of $HOME/.profile.
If you are not familiar with vi, you can search for manuals on Google or use other editors.

    $ vi ~/.profile

    export PATH=$PATH:/usr/local/go/bin
    export PATH="$HOME/.yarn/bin:$PATH"

### Install redis-server

    $ cd ~
    $ wget http://download.redis.io/redis-stable.tar.gz
    $ tar xvzf redis-stable.tar.gz
    $ cd redis-stable
    $ make
    $ sudo cp src/redis-server /usr/local/bin/
    $ sudo cp src/redis-cli /usr/local/bin/
    $ sudo mkdir /etc/redis
    $ sudo mkdir /var/redis
    $ sudo cp utils/redis_init_script /etc/init.d/redis_6379
    $ sudo cp redis.conf /etc/redis/6379.conf

    $ sudo vi /etc/redis/6379.conf

Modify using command below.

    daemonize yes -> daemonize yes
    dir ./ -> dir /var/redis/6379

    $ sudo mkdir /var/redis/6379
    $ sudo update-rc.d redis_6379 defaults
    $ sudo /etc/init.d/redis_6379 start

### Test redis-server
    $ redis-cli
    127.0.0.1:6379> ping
    PONG
    127.0.0.1:6379> exit


### Install nginx
    $ sudo apt-get install nginx

Search on Google for nginx-setting 

### Install NODE 
    $ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    $ sudo apt-get install nodejs

If it doesn’t work, run the command below first.

    $ sudo apt-get install -y build-essential

### Install go-esn
    $ cd ~
    $ git clone https://github.com/ethersocial/go-esn
    $ cd go-esn
    $ chmod 755 build/*
    $ make gesn
    $ sudo cp ~/go-esn/build/bin/gesn /usr/local/bin/

### Run go-esn
If you use Ubuntu, it is easier to control terminal by screen command. You can get the manual by searching Ubuntu screen on Google.

    $ screen -S esn1
    $ gesn --cache=1024 --rpc --rpcaddr 127.0.0.1 --rpcport 8545 --rpcapi "eth,net,web3" console
    Crtl + a, d

If you want to go back to the original terminal,

    $ screen -r esn1

Run go-esn again.

    $ gesn attach

Register pool account and open wallet for transaction. This process is always required, when the wallet is opened.

    > personal.unlockAccount("password")
    > personal.unlockAccount(eth.accounts[0],"password",40000000)



### Install Ethersocial pool

    $ git config --global http.https://gopkg.in.followRedirects true
    $ git clone https://github.com/ethersocial/ethersocial-pool
    $ cd ethersocial-pool
    $ chmod 755 build/*
    $ make all

If you face ethersocial-pool after ls ~/ethersocial-pool/build/bin/, the installation has completed.
    $ ls ~/ethersocial-pool/build/bin/

### Set up Ethersocial pool
    $ mv config.example.json config.json
    $ vi config.json

Set up based on commands below.

```javascript
{
  // The number of cores of CPU.
  "threads": 2,
  // Prefix for keys in redis store
  "coin": "esn",
  // Give unique name to each instance
  "name": "main",

  "proxy": {
    "hashLimit" : 240000000,
    "enabled": true,

    // Bind HTTP mining endpoint to this IP:PORT
    "listen": "0.0.0.0:8888",

    // Allow only this header and body size of HTTP request from miners
    "limitHeadersSize": 1024,
    "limitBodySize": 256,

    /* Set to true if you are behind CloudFlare (not recommended) or behind http-reverse
      proxy to enable IP detection from X-Forwarded-For header.
      Advanced users only. It's tricky to make it right and secure.
    */
    "behindReverseProxy": false,

    // Stratum mining endpoint
    "stratum": {
      "enabled": true,
      // Bind stratum mining socket to this IP:PORT
      "listen": "0.0.0.0:8008",
      "timeout": "120s",
      "maxConn": 8192
    },

    // Try to get new job from geth in this interval
    "blockRefreshInterval": "120ms",
    "stateUpdateInterval": "3s",
    // If there are many rejects because of heavy hash, difficulty should be increased properly.
    "difficulty": 2000000000,

    /* Reply error to miner instead of job if redis is unavailable.
      Should save electricity to miners if pool is sick and they didn't set up failovers.
    */
    "healthCheck": true,
    // Mark pool sick after this number of redis failures.
    "maxFails": 100,
    // TTL for workers stats, usually should be equal to large hashrate window from API section
    "hashrateExpiration": "3h",

    "policy": {
      "workers": 8,
      "resetInterval": "60m",
      "refreshInterval": "1m",

      "banning": {
        "enabled": false,
        /* Name of ipset for banning.
        Check http://ipset.netfilter.org/ documentation.
        */
        "ipset": "blacklist",
        // Remove ban after this amount of time
        "timeout": 1800,
        // Percent of invalid shares from all shares to ban miner
        "invalidPercent": 30,
        // Check after after miner submitted this number of shares
        "checkThreshold": 30,
        // Bad miner after this number of malformed requests
        "malformedLimit": 5
      },
      // Connection rate limit
      "limits": {
        "enabled": false,
        // Number of initial connections
        "limit": 30,
        "grace": "5m",
        // Increase allowed number of connections on each valid share
        "limitJump": 10
      }
    }
  },

  // Provides JSON data for frontend which is static website
  "api": {
    "enabled": true,
    "listen": "0.0.0.0:8080",
    // Collect miners stats (hashrate, ...) in this interval
    "statsCollectInterval": "5s",
    // Purge stale stats interval
    "purgeInterval": "10m",
    // Fast hashrate estimation window for each miner from it's shares
    "hashrateWindow": "30m",
    // Long and precise hashrate from shares, 3h is cool, keep it
    "hashrateLargeWindow": "3h",
    // Collect stats for shares/diff ratio for this number of blocks
    "luckWindow": [64, 128, 256],
    // Max number of payments to display in frontend
    "payments": 50,
    // Max numbers of blocks to display in frontend
    "blocks": 50,

    /* If you are running API node on a different server where this module
      is reading data from redis writeable slave, you must run an api instance with this option enabled in order to purge hashrate stats from main redis node.
      Only redis writeable slave will work properly if you are distributing using redis slaves.
      Very advanced. Usually all modules should share same redis instance.
    */
    "purgeOnly": false
  },

  // Check health of each geth node in this interval
  "upstreamCheckInterval": "5s",

  /* List of geth nodes to poll for new jobs. Pool will try to get work from
    first alive one and check in background for failed to back up.
    Current block template of the pool is always cached in RAM indeed.
  */
  "upstream": [
    {
      "name": "main",
      "url": "http://127.0.0.1:9545",
      "timeout": "10s"
    },
    {
      "name": "backup",
      "url": "http://127.0.0.2:9545",
      "timeout": "10s"
    }
  ],

  // This is standard redis connection options
  "redis": {
    // Where your redis instance is listening for commands
    "endpoint": "127.0.0.1:6379",
    "poolSize": 10,
    "database": 0,
    "password": ""
  },

  // This module periodically remits ether to miners
  "unlocker": {
    "enabled": false,
    // Pool fee percentage
    "poolFee": 1.0,
    // the address is for pool fee. Personal wallet is recommended to prevent from server hacking.
    "poolFeeAddress": "0x8b92c50e1c39466f900a578edb20a49356c4fe24",
    // Amount of donation to a pool maker. 5 percent of pool fee is donated to a pool maker now. If pool fee is 1 percent, 0.05 percent which is 5 percent of pool fee should be donated to a pool maker.
    "donate": true,
    // Unlock only if this number of blocks mined back
    "depth": 120,
    // Simply don't touch this option
    "immatureDepth": 20,
    // Keep mined transaction fees as pool fees
    "keepTxFees": false,
    // Run unlocker in this interval
    "interval": "10m",
    // Gesn instance node rpc endpoint for unlocking blocks
    "daemon": "http://127.0.0.1:8545",
    // Rise error if can't reach geth in this amount of time
    "timeout": "10s"
  },

  // Pay out miners using this module
  "payouts": {
    "enabled": true,
    // Require minimum number of peers on node
    "requirePeers": 5,
    // Run payouts in this interval
    "interval": "12h",
    // Gesn instance node rpc endpoint for payouts processing
    "daemon": "http://127.0.0.1:8545",
    // Rise error if can't reach geth in this amount of time
    "timeout": "10s",
    // Address with pool balance 풀 coinbase wallet address.
    "address": "0x0",
    // Let gesn to determine gas and gasPrice
    "autoGas": true,
    // Gas amount and price for payout tx (advanced users only)
    "gas": "21000",
    "gasPrice": "50000000000",
    // The minimum distribution of mining reward. It is 100 ESN now.
    "threshold": 10000000000,
    // Perform BGSAVE on Redis after successful payouts session
    "bgsave": false
  }
}
```

If you are distributing your pool deployment to several servers or processes,
create several configs and disable unneeded modules on each server. (Advanced users)

I recommend this deployment strategy:

* Mining instance - 1x (it depends, you can run one node for EU, one for US, one for Asia)
* Unlocker and payouts instance - 1x each (strict!)
* API instance - 1x


### Run Pool
It is required to run pool after running screen. If it is not, the terminal could be stopped, and pool doesn’t work.

    $ screen -S pool1
    $ cd ~/ethersocial-pool
    $ ./build/bin/ethersocial-pool config.json
    Crtl + a, d

If you want to go back to pool screen, type the command below.

    $ screen -r pool1


Backend operation has completed so far. 


### Open Firewall
Firewall should be opened to operate this service. Whether Ubuntu firewall is basically opened or not, the firewall should be opened based on your situation.
You can open firewall by opening 80,443,8080,8888,8008.



## Install Frontend

### Modify configuration file

    $ vi ~/ethersocial-pool/www/config/environment.js

Make some modifications in these commands.

    BrowserTitle: 'EtherSocial Mining Pool-Asia1',
    ApiUrl: '//pool-asia1.ethersocial.org/',
    HttpHost: 'http://pool-asia1.ethersocial.org',
    StratumHost: 'pool-asia1.ethersocial.org',
    PoolFee: '1%',


Install nodejs. I suggest using LTS version >= 4.x from https://github.com/nodesource/distributions or from your Linux distribution or simply install nodejs on Ubuntu Xenial 16.04.


The frontend is a single-page Ember.js application that polls the pool API to render miner stats.

    $ cd ~/ethersocial-pool/www
    $ sudo npm install -g ember-cli@2.9.1
    $ sudo npm install -g bower
    $ npm install
    $ bower install
    $ chmod 755 build.sh
    $ ./build.sh
    $ mkdir ~/www
    $ mv ~/ethersocial-pool/www/dist/* ~/www/

As you can see above, the frontend of the pool homepage is created. Then, move to the directory, www, which services the file.


Set up nginx.

    $ sudo vi /etc/nginx/sites-available/default

Modify based on configuration file.

    # Default server configuration 
    # nginx example

    upstream api {
        server 127.0.0.1:8080;
    }

    server {
        listen 80 default_server;
        listen [::]:80 default_server;
        root /home/useraccount/www;

        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;

        server_name _;

        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                try_files $uri $uri/ =404;
        }

        location /api {
                proxy_pass http://api;
        }

    }


After setting nginx is completed, run the command below.

    $ sudo service nginx restart

Type your homepage address or IP address on the web.
If you face screen without any issues, pool installation has completed.


