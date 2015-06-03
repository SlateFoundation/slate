Ext.define('Jarvus.LightBox', {
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
        var me = this;
        
        me.initConfig(config);
        me.addEvents('open', 'close');
        me.callParent(arguments);
        
        me.resizeDuration = me.getAnimate() ? ((11 - me.getResizeSpeed()) * 150) : 0;
        
        me.images = [];
        me.selectors = [];
        
        Ext.onReady(me.onDocReady, me);
    },
    
    onDocReady: function () {
        var me = this;
        
        me.initMarkup();
        me.initEvents();    
    },
    
    initMarkup: function() {
        var me = this,
            lightboxTpl = Ext.create('Ext.Template', me.getLightBoxTpl()),
            ids = [
                'outerImageContainer',
                'imageContainer',
                'image',
                'hoverNav',
                'navPrev',
                'navNext',
                'loading',
                'loadingLink',
                'outerDataContainer',
                'dataContainer',
                'data',
                'details',
                'caption',
                'imageNumber',
                'bottomNav',
                'navClose'
            ],
            size = (me.getAnimate() ? 250 : 1) + 'px';
        
        me.els = {};
        
        me.els.shim = Ext.DomHelper.append(document.body, {
            tag: 'iframe',
            id: 'ux-lightbox-shim'
        }, true);
        
        me.els.overlay = Ext.DomHelper.append(document.body, {
            id: 'ux-lightbox-overlay'
        }, true);
        
        me.els.lightbox = lightboxTpl.append(document.body, {}, true);
   
        Ext.each(ids, function(id){
            me.els[id] = Ext.get('ux-lightbox-' + id);
        }, me);
        
        Ext.each([me.els.overlay, me.els.lightbox, me.els.shim], function(el){
            el.setVisibilityMode(Ext.Element.DISPLAY)
            el.hide();
        });
        
        this.els.outerImageContainer.setStyle({
            width: size,
            height: size
        });
    },
    
    initEvents: function() {
        var me = this,
            close = function(ev) {
                ev.preventDefault();
                me.close();
            };
        
        me.els.overlay.on('click', close);
        me.els.loadingLink.on('click', close);
        me.els.navClose.on('click', close);
        
        me.els.lightbox.on('click', function(ev) {
            if(ev.getTarget().id == 'ux-lightbox') {
                me.close();
            }
        });
        
        me.els.navPrev.on('click', function(ev) {
            ev.preventDefault();
            me.setImage(me.activeImage - 1);
        });
        
        me.els.navNext.on('click', function(ev) {
            ev.preventDefault();
            me.setImage(me.activeImage + 1);
        });
    },
    
    register: function(sel, group) {
        var me = this;
        
        if(me.selectors.indexOf(sel) === -1) {
            me.selectors.push(sel);
        
            Ext.fly(document).on('click', function(ev){
                var target = ev.getTarget(sel);
            
                if (target) {
                    ev.preventDefault();
                    me.open(target, sel, group);
                }
            });
        }
    },
    
    open: function(image, sel, group) {
        var me = this,
            group = group || false;
            
        this.setViewSize();
        
        me.els.overlay.setOpacity(0.1).setVisible(true).animate({
            duration: me.getOverlayDuration(),
            to: {
                opacity: me.getOverlayOpacity()
            },
            listeners:{    
                afteranimate: function() {                    
            
                    var index = 0,
                        // calculate top and left offset for the lightbox
                        pageScroll = Ext.fly(document).getScroll(),
                        lightboxTop = pageScroll.top + (Ext.Element.getViewportHeight() / 10),
                        lightboxLeft = pageScroll.left,
                        
                        setItems;
                        
                    me.images = [];
                    
                    if (!group) {
                        me.images.push([image.href, image.title]);
                    } else {
                        setItems = (typeof sel == 'object' && sel.isComposite) ? sel.elements : Ext.query(sel);
                        
                        Ext.each(setItems, function(item) {
                            if(item.href) {
                                me.images.push([item.href, item.title]);
                            }           
                        });
            
                        while (me.images[index][0] != image.href) {
                            index++;
                        }
                    }
            
                    
                    
                    me.els.lightbox.setStyle({
                        top: lightboxTop + 'px',
                        left: lightboxLeft + 'px'
                    }).show();
                
                    me.setImage(index);
                
                    me.fireEvent('open', me.images[index]);                                        
                }
            }
        });
    },
    
    setViewSize: function(){
        var me = this,
            viewSize = Ext.Element.getViewSize();
        
        me.els.overlay.setStyle({
            width: viewSize.width + 'px',
            height: viewSize.height + 'px'
        });
        
        me.els.shim.setStyle({
            width: viewSize.width + 'px',
            height: viewSize.height + 'px'
        }).show();
    },
    
    setImage: function(index){
        var me = this,
            preload = new Image();
            
        me.activeImage = index;
        
        me.disableKeyNav();  
        
        if (me.getAnimate()) {
            me.els.loading.show();
        }
        
        me.els.image.hide();
        me.els.hoverNav.hide();
        me.els.navPrev.hide();
        me.els.navNext.hide();
        me.els.dataContainer.setOpacity(0.0001);
        me.els.imageNumber.hide();
        
        preload.onload = Ext.bind(function(){
            me.els.image.dom.src = me.images[me.activeImage][0];
            me.resizeImage(preload.width, preload.height);
        });
        
        preload.src = me.images[me.activeImage][0];
    },
    
    resizeImage: function(w, h){
        var me = this,
            borderSize = me.getBorderSize(),
            wCur = me.els.outerImageContainer.getWidth(),
            hCur = me.els.outerImageContainer.getHeight() - (borderSize * 2),
            
            maxH = Ext.Element.getViewportHeight() * .85,
            maxW = Ext.Element.getViewportWidth() * .85,
            
            w = Math.max(w, me.getMinWidth()),
            h = Math.max(h, me.getMinHeight()),
            
            ratioV = (w/h),
            ratioH = (h/w),
            
            wNew, hNew,
            
            wDiff, hDiff,
            afterResize = function(){
                me.els.hoverNav.setWidth(me.els.imageContainer.getWidth() + 'px');
    
                me.els.navPrev.setHeight(h + 'px');
                me.els.navNext.setHeight(h + 'px');
    
                me.els.outerDataContainer.setWidth(wNew + 'px');
    
                me.showImage();
            };
        
        
        if (w <= maxW && h <= maxH) {
            wNew = w + (borderSize * 2);
            hNew = h + (borderSize * 2);
        } else {
            //resize image smaller, attempting to maintain aspect ratio.
            if (maxH != maxW) {
                wNew = ((Math.min(maxH, maxW) - (borderSize*2)) / w) * w;
                hNew = ((Math.min(maxH, maxW) - (borderSize*2)) / h) * h;
            } else {
                wNew = ((maxW - (borderSize*2)) / w) * w;
                hNew = ((maxH - (borderSize*2)) / h) * h;
            }
        }
        
        wDiff = wCur - wNew;
        hDiff = hCur - hNew;
        
        console.log(wNew, 'wNew', hNew, 'hNew');

        if (hDiff != 0 || wDiff != 0) {
            me.els.outerImageContainer.shift({
                height: hNew,
                width: wNew,
                duration: me.resizeDuration,
                callback: afterResize,
                delay: 50
            });
        }
        else {
            afterResize.call(me);
        }
    },
    
    showImage: function(){
        var me = this;
        
        me.els.loading.hide();
        me.els.image.show({
            duration: me.resizeDuration,
            listeners: {
                afteranimate: Ext.bind(me.updateDetails, me)
            }
        });
        me.preloadImages();
    },
    
    updateDetails: function(){
        var me = this,
            detailsWidth = me.els.data.getWidth(true) - me.els.navClose.getWidth() - 10;
            
        me.els.details.setWidth((detailsWidth > 0 ? detailsWidth : 0) + 'px');
        
        me.els.caption.update(me.images[me.activeImage][1]);

        me.els.caption.show();
        if (me.images.length > 1) {
            me.els.imageNumber.update(me.labelImage + ' ' + (me.activeImage + 1) + ' ' + me.labelOf + '  ' + me.images.length);
            me.els.imageNumber.show();
        }

        me.els.dataContainer.show({
            duration: me.resizeDuration/2,
            listeners: {
                afteranimate: function() {
                    var viewSize = Ext.Element.getViewSize();
                    me.els.overlay.setHeight(viewSize.height + 'px');
                    me.updateNav();
                }
            }
        });
    },
    updateNav: function(){
        var me = this;
        
        me.enableKeyNav();

        me.els.hoverNav.show();

        // if not first image in set, display prev image button
        if (me.activeImage > 0) {
            me.els.navPrev.show();
        }

        // if not last image in set, display next image button
        if (me.activeImage < (me.images.length - 1)) {
            me.els.navNext.show();
        }
    },

    enableKeyNav: function() {
        var me = this;
        Ext.fly(document).on('keydown', me.keyNavAction, me);
    },

    disableKeyNav: function() {
        var me = this;
        Ext.fly(document).un('keydown', me.keyNavAction, me);
    },

   keyNavAction: function(ev) {
        var me = this,
            keyCode = ev.getKey();
    
        if (keyCode == 88 || // x
            keyCode == 67 || // c
            keyCode == 27
        ) {
            me.close();
        }
        else if (keyCode == 80 || keyCode == 37) { // display previous image
            if (me.activeImage != 0) {
                me.setImage(activeImage - 1);
            }
        }
        else if (keyCode == 78 || keyCode == 39) { // display next image
            if (me.activeImage != (me.images.length - 1)) {
                me.setImage(me.activeImage + 1);
            }
        }
    },

    preloadImages: function(){
        var me = this,
            next, prev;
        
        if (me.images.length > me.activeImage + 1) {
            next = new Image();
            next.src = me.images[me.activeImage + 1][0];
        }
        if (me.activeImage > 0) {
            prev = new Image();
            prev.src = me.images[me.activeImage - 1][0];
        }
    },

    close: function(){
        var me = this;
        
        me.disableKeyNav();
        me.els.lightbox.hide();
        me.els.overlay.hide({
            duration: me.overlayDuration
        });
        me.els.shim.hide();
        
        me.fireEvent('close', me.activeImage);
    }

  

});