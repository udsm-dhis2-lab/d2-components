// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
const proxy = require('http-proxy-middleware');
const proxyConfig = require('../../../proxy-config.json');

module.exports = function expressMiddleware(router) {
  const config = proxyConfig['/'];
  ['/api'].forEach((domain) => {
    router.use(domain, proxy.createProxyMiddleware(config));
  });
};
