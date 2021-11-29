Ext.define('Slate.ui.PanelLegend', {
    extend: 'Ext.Component',
    xtype: 'slate-panellegend',


    // component configuration
    componentCls: 'panel-legend',
    padding: '5 10',
    tpl: `
        <dl class="panel-legend-list">
            <tpl for=".">
                <div class="panel-legend-item">
                    <dt><i class="fa fa-{icon} {iconCls}"></i></dt>
                    <dd>{label}</dd>
                </div>
            </tpl>
        </dl>
    `,
});
