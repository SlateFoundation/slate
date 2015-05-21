/**
 * Provides {@link #method-pushPath} for controllers
 */
Ext.define('Jarvus.ext.override.util.PushHistory', (function() {
    
    var stateSuspendedCount = 0,
        lastPushStateArgs;
    
    return {
        override: 'Ext.util.History',
    
        pageTitleSeparator: ' &mdash; ',
    
        /**
         * Silently push a given path to the address bar without triggering a routing event.
         * This is useful to call after a user has _already_ entered a UI state and the current address
         * _may_ need to be synchronized. If the given path was already in the address bar this method
         * has no effect.
         *
         * @param {String/String[]/Ext.data.Model} url The url path to push
         */
        pushState: function(url, title) {
            lastPushStateArgs = arguments;
                
            if (stateSuspendedCount) {
                return;
            }
            
            var me = this,
                titleDom = me.pageTitleDom,
                titleBase = me.pageTitleBase;

            Ext.util.History.add(url, true);

            if(title) {
                if(!titleDom) {
                    titleDom = me.pageTitleDom = document.querySelector('title');
                    titleBase = me.pageTitleBase = titleDom.innerHTML;
                }
    
                titleDom.innerHTML = title + me.pageTitleSeparator + titleBase;
            }
        },
        
        /**
         * Supress all future calls to {@link #method-pushState} until {@link #method-resumeState} is called.
         * This is useful when batching a series of scripted UI state changes that may independently cause
         * {@link #method-pushState} to be called.
         */
        suspendState: function() {
            stateSuspendedCount++;
        },
        
        /**
         * Supress all future calls to {@link #method-pushState} until {@link #method-resumeState} is called.
         * This is useful when batching a series of scripted UI state changes that may independently cause
         * {@link #method-pushState} to be called.
         * 
         * @param {Boolean} [flush=true] True to apply the last call to {@link #method-pushState}
         */
        resumeState: function(flush) {
            if (stateSuspendedCount && !--stateSuspendedCount && flush !== false && lastPushStateArgs) {
                this.pushState.apply(this, lastPushStateArgs);
            }
        }
    };
})());