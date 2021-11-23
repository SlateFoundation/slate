Ext.define('SlateAdmin.view.people.PanelLegend', {
    extend: 'Ext.Component',
    xtype: 'people-details-contacts-panellegend',
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
