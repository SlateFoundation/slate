/* jshint undef: true, unused: true, browser: true, quotmark: single, curly: true */
/* global Ext */
Ext.define('Jarvus.util.format.FuzzyTime', {
    override: 'Ext.util.Format',

    fuzzyTime: function(date) {
        var msPerMinute = 60 * 1000,
            msPerHour = msPerMinute * 60,
            msPerDay = msPerHour * 24,
            msPerMonth = msPerDay * 30,
            msPerYear = msPerDay * 365,
            previous = date.getTime(),
            elapsed = (new Date()).getTime() - previous,
            qty;

        if (elapsed < 0) {
            return Ext.util.Format.date(date, 'D, M j, g:i a');
        } else if (elapsed < msPerMinute) {
            qty = Math.round(elapsed/1000);
            return qty + ' second'+(qty==1?'':'s');
        } else if (elapsed < msPerHour) {
            qty = Math.round(elapsed/msPerMinute);
            return qty + ' minute'+(qty==1?'':'s');
        } else if (elapsed < msPerDay ) {
            qty = Math.round(elapsed/msPerHour);
            return qty + ' hour'+(qty==1?'':'s');
        } else if (elapsed < msPerMonth) {
            qty = Math.round(elapsed/msPerDay);
            return qty + ' day'+(qty==1?'':'s');
        } else if (elapsed < msPerYear) {
            qty = Math.round(elapsed/msPerMonth);
            return qty + ' month'+(qty==1?'':'s');
        } else {
            qty = Math.round(elapsed/msPerYear);
            return qty + ' year'+(qty==1?'':'s');
        }
    }
});