(() => {
    const [,apiHost] = location.search.match(/[?&]apiHost=([^&]+)/) || [];
    const [,apiSSL] = location.search.match(/[?&]apiSSL=([^&]+)/) || [];

    if (!apiHost) {
        document.body.innerHTML = 'Page must be loaded with <code>?apiHost=slate.example.org</code> set'
        return;
    }

    const framePath = document.currentScript.getAttribute('data-frame');

    if (framePath) {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'document';
        xhr.withCredentials = true;
        xhr.open('GET', `http${apiSSL?'s':''}://${apiHost}${framePath}`);
        xhr.onload = () => {
            if (xhr.status === 200) {
                // graft head elements
                xhr.response
                    .querySelectorAll('head > *:not([href^="/webapps/"])')
                    .forEach(node => {
                        _patchHeadElement(node);
                        document.head.appendChild(node);
                    });

                // graft body elements
                xhr.response
                    .querySelectorAll('body > *:not(script)')
                    .forEach(node => {
                        _patchBodyElement(node);
                        document.body.appendChild(node);
                    });

                // graft environmental data
                xhr.response
                    .querySelectorAll('script')
                    .forEach(node => {
                        if (node.textContent.match(/window\.SiteEnvironment\W/)) {
                            eval(node.textContent)
                        }
                    });

                // finally: load app
                _loadApp();
            } else {
                console.error('could not load page frame from apiHost, got status=%o', xhr.status);
            }
        };
        xhr.send();
    } else {
        _loadApp();
    }


    function _loadApp() {
        const appScript = document.createElement('script');
        appScript.setAttribute('id', 'microloader');
        appScript.setAttribute('type', 'text/javascript');
        appScript.setAttribute('src', 'bootstrap.js');
        document.body.appendChild(appScript);
    }

    function _patchHeadElement(node) {
        // capture full hrefs from source document
        if (node.href) {
            node.href = node.href;
        }
    }

    function _patchBodyElement(node) {
        // skip manifest-patching script
        if (node.nodeName == 'SCRIPT') {
            if (node.text.match(/^\s*Ext\.manifest\.resources\.path\s*=/)) {
                return;
            }
        } else {
            // capture full hrefs/srcs from source document
            node.querySelectorAll('[src]').forEach(srcNode => {
                srcNode.src = srcNode.src;
            });
            node.querySelectorAll('[href]').forEach(hrefNode => {
                hrefNode.href = hrefNode.href;

                if (hrefNode.nodeName == 'A') {
                    hrefNode.target = '_blank';
                }
            });

            const externalSvgQueue = new Set();
            node.querySelectorAll('svg').forEach(svgNode => {
                svgNode.querySelectorAll('use').forEach(svgUseNode => {
                    const [svgPath, svgHash] = svgUseNode.href.baseVal.split('#', 2);

                    externalSvgQueue.add(`http://${apiHost}${svgPath}`);

                    const newUseNode = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                    newUseNode.setAttribute('href', `#${svgHash}`);
                    svgNode.replaceChild(newUseNode, svgUseNode);
                });
            });

            // load all external SVGs
            for (const svgUrl of externalSvgQueue) {
                const svgXhr = new XMLHttpRequest();
                svgXhr.responseType = 'document';
                svgXhr.withCredentials = true;
                svgXhr.open('GET', svgUrl);
                svgXhr.onload = () => {
                    if (svgXhr.status === 200) {
                        document.body.appendChild(svgXhr.response.firstChild);
                    }
                };
                svgXhr.send();
            }
        }
    }
})();