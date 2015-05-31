Ext.define('Jarvus.ux.LightBox', {
    extend: 'Ext.util.Observable',
    singleton: true,
    requires: [
        'Ext.Template'
    ],
    config: {
        overlayOpacity: 0.85,
        overlayDuration: 200,
        animate: true,
        resizeSpeed: 8,
        minWidth: 300,
        minHeight: 50,
        borderSize: 10,
        labelImage: "Image",
        labelOf: "of",
        lightBoxTpl: [
            '<div id="ux-lightbox">',
                '<div id="ux-lightbox-outerImageContainer">',
                    '<div id="ux-lightbox-imageContainer">',
                        '<img id="ux-lightbox-image">',
                        '<div id="ux-lightbox-hoverNav">',
                            '<a href="#" id="ux-lightbox-navPrev"></a>',
                            '<a href="#" id="ux-lightbox-navNext"></a>',
                        '</div>',
                        '<div id="ux-lightbox-loading">',
                            '<a id="ux-lightbox-loadingLink"></a>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div id="ux-lightbox-outerDataContainer">',
                    '<div id="ux-lightbox-dataContainer">',
                        '<div id="ux-lightbox-data">',
                            '<div id="ux-lightbox-details">',
                                '<span id="ux-lightbox-caption"></span>',
                                '<span id="ux-lightbox-imageNumber"></span>',
                            '</div>',
                            '<div id="ux-lightbox-bottomNav">',
                                '<a href="#" id="ux-lightbox-navClose"></a>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('')
    },
    
    constructor : function (config) {
        this.initConfig(config);
        this.addEvents('open', 'close');
        this.callParent(arguments);
        
        this.resizeDuration = this.getAnimate() ? ((11 - this.getResizeSpeed()) * 150) : 0;
        this.images = [];
        this.selectors = [];
        
        Ext.onReady(this.onDocReady, this);
    },
    
    onDocReady: function () {
    
        this.initMarkup();
        this.initEvents();
    
    },
    
    initMarkup: function() {
        
        this.els = {};
        
        this.els.shim = Ext.DomHelper.append(document.body, {
            tag: 'iframe',
            id: 'ux-lightbox-shim'
        }, true);
        
        this.els.overlay = Ext.DomHelper.append(document.body, {
            id: 'ux-lightbox-overlay'
        }, true);
        
        var lightboxTpl = Ext.create('Ext.Template', this.getLightBoxTpl());
        this.els.lightbox = lightboxTpl.append(document.body, {}, true);
        
        var ids =['outerImageContainer', 'imageContainer', 'image', 'hoverNav', 'navPrev', 'navNext', 'loading', 'loadingLink',
        'outerDataContainer', 'dataContainer', 'data', 'details', 'caption', 'imageNumber', 'bottomNav', 'navClose'];
        
        Ext.each(ids, function(id){
            this.els[id] = Ext.get('ux-lightbox-' + id);
        }, this);
        
        Ext.each([this.els.overlay, this.els.lightbox, this.els.shim], function(el){
            el.setVisibilityMode(Ext.Element.DISPLAY)
            el.hide();
        });
        
        var size = (this.getAnimate() ? 250 : 1) + 'px';
        this.els.outerImageContainer.setStyle({
            width: size,
            height: size
        });
    },
    
    initEvents: function() {
        var close = function(ev) {
            ev.preventDefault();
            this.close();
        };
        
        this.els.overlay.on('click', close, this);
        this.els.loadingLink.on('click', close, this);
        this.els.navClose.on('click', close, this);
        
        this.els.lightbox.on('click', function(ev) {
            if(ev.getTarget().id == 'ux-lightbox') {
                this.close();
            }
        }, this);
        
        this.els.navPrev.on('click', function(ev) {
            ev.preventDefault();
            this.setImage(this.activeImage - 1);
        }, this);
        
        this.els.navNext.on('click', function(ev) {
            ev.preventDefault();
            this.setImage(this.activeImage + 1);
        }, this);
    },
    
    register: function(sel, group) {
        if(this.selectors.indexOf(sel) === -1) {
            this.selectors.push(sel);
        
            Ext.fly(document).on('click', function(ev){
                var target = ev.getTarget(sel);
            
                if (target) {
                    ev.preventDefault();
                    this.open(target, sel, group);
                }
            }, this);
        }
    },
    
    open: function(image, sel, group) {
        group = group || false;
        this.setViewSize();
        this.els.overlay.setOpacity(0.1).setVisible(true).animate({
            duration: this.getOverlayDuration(),
            to: {
                opacity: this.getOverlayOpacity()
            },
            listeners:{    
                afteranimate: function() {
                    this.images = [];
            
                    var index = 0;
                    
                    if(!group)
                    {
                        this.images.push([image.href, image.title]);
                    }
                    else
                    {
                        var setItems = Ext.query(sel);
                        
                        Ext.each(setItems, function(item) {
                            if(item.href) {
                                this.images.push([item.href, item.title]);
                            }           
                        },this);
            
                        while (this.images[index][0] != image.href) {
                            index++;
                        }
                    }
            
                    // calculate top and left offset for the lightbox
                    var pageScroll = Ext.fly(document).getScroll();
                
                    var lightboxTop = pageScroll.top + (Ext.Element.getViewportHeight() / 10);
                    var lightboxLeft = pageScroll.left;
                    
                    this.els.lightbox.setStyle({
                        top: lightboxTop + 'px',
                        left: lightboxLeft + 'px'
                    }).show();
                
                    this.setImage(index);
                
                    this.fireEvent('open', this.images[index]);                                        
                },
                scope: this
            }
        });
    },
    
    setViewSize: function(){
        var viewSize = Ext.Element.getViewSize();
        
        this.els.overlay.setStyle({
            width: viewSize.width + 'px',
            height: viewSize.height + 'px'
        });
        
        this.els.shim.setStyle({
            width: viewSize.width + 'px',
            height: viewSize.height + 'px'
        }).show();
    },
    
    setImage: function(index){
        this.activeImage = index;
        
        this.disableKeyNav();  
        
        if (this.getAnimate()) {
            this.els.loading.show();
        }
        
        this.els.image.hide();
        this.els.hoverNav.hide();
        this.els.navPrev.hide();
        this.els.navNext.hide();
        this.els.dataContainer.setOpacity(0.0001);
        this.els.imageNumber.hide();
        
        var preload = new Image();
        
        preload.onload = Ext.bind(function(){
            this.els.image.dom.src = this.images[this.activeImage][0];
            this.resizeImage(preload.width, preload.height);
        }, this);
        
        preload.src = this.images[this.activeImage][0];
    },
    
    resizeImage: function(w, h){
        w = Math.max(w, this.getMinWidth());
        h = Math.max(h, this.getMinHeight());
        
        var wCur = this.els.outerImageContainer.getWidth();
        var hCur = this.els.outerImageContainer.getHeight();

        var wNew = (w + this.borderSize * 2);
        var hNew = (h + this.borderSize * 2);

        var wDiff = wCur - wNew;
        var hDiff = hCur - hNew;

        var afterResize = function(){
            this.els.hoverNav.setWidth(this.els.imageContainer.getWidth() + 'px');

            this.els.navPrev.setHeight(h + 'px');
            this.els.navNext.setHeight(h + 'px');

            this.els.outerDataContainer.setWidth(wNew + 'px');

            this.showImage();
        };

        if (hDiff != 0 || wDiff != 0) {
            this.els.outerImageContainer.shift({
                height: hNew,
                width: wNew,
                duration: this.resizeDuration,
                scope: this,
                callback: afterResize,
                delay: 50
            });
        }
        else {
            afterResize.call(this);
        }
    },
    
    showImage: function(){
        this.els.loading.hide();
        this.els.image.show({
            duration: this.resizeDuration,
            listeners: {
                scope: this,
                afteranimate: function(){
                    this.updateDetails();
                }
            }
        });
        this.preloadImages();
    },
    
    updateDetails: function(){
        var detailsWidth = this.els.data.getWidth(true) - this.els.navClose.getWidth() - 10;
        this.els.details.setWidth((detailsWidth > 0 ? detailsWidth : 0) + 'px');
        
        this.els.caption.update(this.images[this.activeImage][1]);

        this.els.caption.show();
        if (this.images.length > 1) {
            this.els.imageNumber.update(this.labelImage + ' ' + (this.activeImage + 1) + ' ' + this.labelOf + '  ' + this.images.length);
            this.els.imageNumber.show();
        }

        this.els.dataContainer.show({
            duration: this.resizeDuration/2,
            listeners: {
                scope: this,
                afteranimate: function() {
                    var viewSize = Ext.Element.getViewSize();
                    this.els.overlay.setHeight(viewSize.height + 'px');
                    this.updateNav();
                }
            }
        });
    },
    updateNav: function(){
       this.enableKeyNav();

       this.els.hoverNav.show();

        // if not first image in set, display prev image button
        if (this.activeImage > 0) {
            this.els.navPrev.show();
        }

        // if not last image in set, display next image button
        if (this.activeImage < (this.images.length - 1)) {
            this.els.navNext.show();
        }
    },

    enableKeyNav: function() {
        Ext.fly(document).on('keydown', this.keyNavAction, this);
    },

    disableKeyNav: function() {
        Ext.fly(document).un('keydown', this.keyNavAction, this);
    },

   keyNavAction: function(ev) {
        var keyCode = ev.getKey();
    
        if (keyCode == 88 || // x
            keyCode == 67 || // c
            keyCode == 27
        ) {
            this.close();
        }
        else if (keyCode == 80 || keyCode == 37) { // display previous image
            if (this.activeImage != 0) {
                this.setImage(activeImage - 1);
            }
        }
        else if (keyCode == 78 || keyCode == 39) { // display next image
            if (this.activeImage != (this.images.length - 1)) {
                this.setImage(this.activeImage + 1);
            }
        }
    },

    preloadImages: function(){
        var next, prev;
        
        if (this.images.length > this.activeImage + 1) {
            next = new Image();
            next.src = this.images[this.activeImage + 1][0];
        }
        if (this.activeImage > 0) {
            prev = new Image();
            prev.src = this.images[this.activeImage - 1][0];
        }
    },

    close: function(){
        this.disableKeyNav();
        this.els.lightbox.hide();
        this.els.overlay.hide({
            duration: this.overlayDuration
        });
        this.els.shim.hide();
        this.fireEvent('close', this.activeImage);
    }

  

});