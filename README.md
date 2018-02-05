## Open Source EtherSocial Mining Pool

![Miner's stats page](https://user-images.githubusercontent.com/7374093/31591180-43c72364-b236-11e7-8d47-726cd66b876a.png)

[![Join the chat at https://gitter.im/sammy007/open-ethereum-pool](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/sammy007/open-ethereum-pool?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/sammy007/open-ethereum-pool.svg?branch=develop)](https://travis-ci.org/sammy007/open-ethereum-pool) [![Go Report Card](https://goreportcard.com/badge/https://github.com/ethersocial/ethersocial-pool)](https://goreportcard.com/report/https://github.com/ethersocial/ethersocial-pool)

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
  * gesc

**I highly recommend to use Ubuntu 16.04 LTS.**

### go lang 설치

    $ sudo apt-get install -y build-essential
    $ wget https://redirector.gvt1.com/edgedl/go/go1.9.2.linux-amd64.tar.gz
    $ tar zxvf go1.9.2.linux-amd64.tar.gz 
    $ sudo mv go /usr/local

아래 명령어를 입력합니다.

    $ export GOROOT=/usr/local/go
    $ export PATH=$GOROOT/bin:$PATH

나중에 다시 로그인했을 때를 대비해 $HOME/.profile 의 제일 아래에 동일한 내용을 입력합니다.
vi 사용법을 모르시면 구글에서 검색을 하시거나 또는 다른 에디터를 사용해도 됩니다.

    $ vi ~/.profile

    export PATH=$PATH:/usr/local/go/bin
    export PATH="$HOME/.yarn/bin:$PATH"

### redis-server 설치

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

다음 내용으로 수정합니다.

    daemonize yes -> daemonize yes
    dir ./ -> dir /var/redis/6379

    $ sudo mkdir /var/redis/6379
    $ sudo update-rc.d redis_6379 defaults
    $ sudo /etc/init.d/redis_6379 start

### redis-server 테스트
    $ redis-cli
    127.0.0.1:6379> ping
    PONG
    127.0.0.1:6379> exit


### nginx 설치
    $ sudo apt-get install nginx

nginx 설정은 다른 구글문서를 참고해주세요.

### NODE 설치
    $ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    $ sudo apt-get install nodejs

혹시 안되시는 분은 다음을 먼저 실행 해주세요.

    $ sudo apt-get install -y build-essential

### go-esc 설치
    $ cd ~
    $ git clone https://github.com/ethersocial/go-esc
    $ cd go-esc
    $ chmod 755 build/*
    $ make gesc
    $ sudo cp ~/go-esc/build/bin/gesc /usr/local/bin/

### go-esc 실행
우분투에서는 screen 명령어를 이용해서 활용을 하는 것이 터미널을 관리할 때 편리합니다. 구글에서 ubuntu screen 을 검색해서 사용법을 익혀주세요.

    $ screen -S esc1
    $ gesc --cache=1024 --rpc --rpcaddr 127.0.0.1 --rpcport 8545 --rpcapi "eth,net,web3" console
    Crtl + a, d

원래 터미널로 다시 돌아가고 싶을때는

    $ screen -r esc1

원래 터미널로 돌아온 상태에서 go-esc를 한 번 더 실행합니다.

    $ gesc attach

풀에서 사용할 계정을 새로 생성하고 지갑을 열어줍니다. 그래야 출금이 됩니다. 이 과정은 지갑을 재구동할 때마다 빠뜨리지 말고 실행해야합니다.

    > personal.unlockAccount("비밀번호")
    > personal.unlockAccount(eth.accounts[0],"비밀번호",40000000)



### ethersocial pool 설치

    $ git config --global http.https://gopkg.in.followRedirects true
    $ git clone https://github.com/ethersocial/ethersocial-pool
    $ cd ethersocial-pool
    $ chmod 755 build/*
    $ make all

다음을 했을 때 ethersocial-pool 이 나오면 설치 성공입니다.
    $ ls ~/ethersocial-pool/build/bin/

### ethersocial pool 설정
    $ mv config.example.json config.json
    $ vi config.json

아래 부분을 보고 설정을 합니다.

```javascript
{
  // CPU 코어수입니다.
  "threads": 2,
  // Prefix for keys in redis store
  "coin": "esc",
  // Give unique name to each instance
  "name": "main",

  "proxy": {
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
    // 해시가 너무 몰려서 reject이 자주 발생하는 경우에는 난이도를 적절히 올려주어야합니다.
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
    "hashLimit" : 240000000,
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
      "url": "http://127.0.0.1:8545",
      "timeout": "10s"
    },
    {
      "name": "backup",
      "url": "http://127.0.0.2:8545",
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
    // 풀피를 받을 주소입니다. 서버내의 지갑 주소로 해도 되지만 서버로의 해킹 공격이 많기 때문에 가능하면 서버 외부의 개인지갑 주소로 하는 것이 안전합니다.
    "poolFeeAddress": "0x8b92c50e1c39466f900a578edb20a49356c4fe24",
    // 풀 제작자에게 풀피 중 일부를 기증하는 부분입니다. 현재 풀 피중의 5%를 기증하는 것으로 설정되어 있습니다. 만일 풀피가 1%라면 그 중의 5%이므로 0.05%가 개발자에게 갑니다.
    "donate": true,
    // Unlock only if this number of blocks mined back
    "depth": 120,
    // Simply don't touch this option
    "immatureDepth": 20,
    // Keep mined transaction fees as pool fees
    "keepTxFees": false,
    // Run unlocker in this interval
    "interval": "10m",
    // Gesc instance node rpc endpoint for unlocking blocks
    "daemon": "http://127.0.0.1:8545",
    // Rise error if can't reach geth in this amount of time
    "timeout": "10s"
  },

  // Pay out miners using this module
  "payouts": {
    "enabled": true,
    // Require minimum number of peers on node
    "requirePeers": 2,
    // Run payouts in this interval
    "interval": "12h",
    // Gesc instance node rpc endpoint for payouts processing
    "daemon": "http://127.0.0.1:8545",
    // Rise error if can't reach geth in this amount of time
    "timeout": "10s",
    // Address with pool balance 풀 coinbase 지갑의 주소.
    "address": "0x0",
    // Let gesc to determine gas and gasPrice
    "autoGas": true,
    // Gas amount and price for payout tx (advanced users only)
    "gas": "21000",
    "gasPrice": "50000000000",
    // 채굴보상 분배 최소량입니다. 현재 100 ESC로 설정되어 있습니다.
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


### Pool 실행
마찬가지로 screen을 실행한 후 풀을 실행해야 합니다. 그렇지 않으면 터미널이 닫히면서 풀 동작이 멈춥니다.

    $ screen -S pool1
    $ cd ~/ethersocial-pool
    $ ./build/bin/ethersocial-pool config.json
    Crtl + a, d

해당 스크린으로 돌아가려면 다음과 같이 입력합니다.

    $ screen -r pool1


여기까지해서 백엔드 작동을 완료했습니다. 


### 방화벽 오픈
이 서비스들을 작동시키리면 방화벽을 오픈해야합니다. 기본적으로 우분투 방화벽 설정을 한 곳도 있고 안한 곳도 있는데 각자의 환경에 맞추어 방화벽을 오픈합니다.
80,443,8080,8888,8008 을 열어주면 됩니다.



## Frontend 설치

### 설정파일 수정

    $ vi ~/ethersocial-pool/www/config/environment.js

다음 부분을 적절히 변경합니다.

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

위 처럼 풀의 홈페이지 부분 프론트엔드를 만들었습니다. 그리고 그 파일을 서비스할 디렉토리 www로 이동합니다.


nginx를 설정해야합니다.

    $ sudo vi /etc/nginx/sites-available/default

다음 설정파일을 보고 적절히 수정합니다.

    # Default server configuration 
    # nginx 설정 예제.

    upstream api {
        server 127.0.0.1:8080;
    }

    server {
        listen 80 default_server;
        listen [::]:80 default_server;
        root /home/사용자계정/www;

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


설정이 완료됐으면 다음을 실행합니다.

    $ sudo service nginx restart

웹브라우저에서 자신의 홈페이지 또는 IP를 입력해봅니다.
화면이 제대로 뜨고 있다면 풀 설치 성공입니다.


