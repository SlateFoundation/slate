Ext.define('Emergence.cms.view.Preview', {
    extend: 'Ext.Component',
    xtype: 'emergence-cms-preview',

    tagsListTpl: '<tpl for="." between=", "><a href="<tpl if="Handle">/tags/{Handle}<tpl else>#</tpl>">{Title:htmlEncode}</a></tpl>',
    itemTpl: '<div class="content-item {contentCls}" data-itemId="{itemId}">{html}</div>',

    /**
     * CAUTION:
     * When changing this template, also update the server-side version
     */

    renderTpl: [
        '<article class="reading-width">',
        '   <header class="article-header">',
        '       <h2 class="header-title">',
        '           <a id="{id}-titleLink" data-ref="titleLink" href="#"></a>',
        '       </h2>',
        '   </header>',

        '   <div id="{id}-infoWrapper" data-ref="infoWrapper" class="section-info" style="display: none">',
        '       Posted ',
        '       <span id="{id}-authorWrapper" data-ref="authorWrapper" class="author" style="display: none">',
        '           by <a id="{id}-authorLink" data-ref="authorLink" href="#">anonymous</a>',
        '       </span>',
        '       <span id="{id}-contextWrapper" data-ref="contextWrapper" class="context" style="display: none">',
        '            in ',
        '           <a id="{id}-contextLink" data-ref="contextLink"></a>',
        '       </span>',
        '       <span id="{id}-timeWrapper" data-ref="timeWrapper" class="timestamp" style="display: none">',
        '            on ',
        '           <time id="{id}-timeEl" data-ref="timeEl" pubdate></time>',
        '       </span>',
        '   </div>',

        '   <section id="{id}-itemsCt" data-ref="itemsCt" class="section-body"></section>',

        '   <footer class="section-footer">',
        '       <div id="{id}-tagsWrapper" data-ref="tagsWrapper" class="post-tags" style="display: none">',
        '           Tags: <span id="{id}-tagsCt" data-ref="tagsCt"></span>',
        '       </div>',
        '   </footer>',
        '</article>'
    ],
    childEls: [
        'titleLink',
        'infoWrapper',
        'authorWrapper',
        'authorLink',
        'timeWrapper',
        'timeEl',
        'contextWrapper',
        'contextLink',
        'tagsWrapper',
        'tagsCt',
        'itemsCt'
    ]
});