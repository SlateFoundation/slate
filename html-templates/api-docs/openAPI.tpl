{extends designs/site.tpl}

{block "title"}{$info.title|escape} &mdash; {$dwoo.parent}{/block}

{block "branding"}{/block}
{block "header-bottom"}{/block}
{block "footer-top"}{/block}
{block "footer"}{/block}

{block "content"}
    <?php
        // we need to keep a reference to the top-level document for resolving JSONSchema refs
        $GLOBALS['swaggerDocument'] = $this->scope['swaggerDocument'] = &$this->scope;
    ?>

    {template definition input definitionId=null}
        <?php
            $this->scope['swaggerDocument'] = $GLOBALS['swaggerDocument'];
        ?>

        {$input = Emergence\OpenAPI\Reader::flattenDefinition($input, $swaggerDocument)}
        {$definitionId = default($definitionId, Emergence\OpenAPI\Reader::getDefinitionIdFromPath($input._resolvedRef))}

        {if $input.properties}
            <table class="docs-table schema-table">
                {if $definitionId}
                    <caption>Model: <a href="#{unique_dom_id}models//{$definitionId}{/unique_dom_id}">{$definitionId}</a></caption>
                {/if}
                <thead>
                    <tr>
                        <th>Name</th>
                        <th class="text-center">Required</th>
                        <th>Schema</th>
                    </tr>
                </thead>

                <tbody>
                {foreach key=property item=propertyData from=$input.properties}
                    <tr>
                        <td><code>{$property}</code></td>
                        <td class="text-center">{tif is_array($input.required) && in_array($property, $input.required) ? '&#10003;' : '<span class="muted">&mdash;</span>'}</td>
                        <td>{definition $propertyData}</td>
                    </tr>
                    {if $propertyData.description}
                        <tr>
                            <td class="merge-up" colspan="3"><div class="markdown property-description">{$propertyData.description|escape|markdown}</div></td>
                        </tr>
                    {/if}
                {/foreach}
                </tbody>
            </table>
        {else}
            {if $input.type == 'array'}
                [array] {definition $input.items}
            {else}
                {$input.type}
                {if $input.format}
                    ({$input.format})
                {/if}
                {if $input.enum}
                    (enum)
                    <ul>
                        {foreach item=value from=$input.enum}
                            <li><q>{$value|escape}</q></li>
                        {/foreach}
                    </ul>
                {/if}
            {/if}
        {/if}
    {/template}

    <div class="split-view">
        <div class="nav-view">
            <ul class="docs-toc">
                <li><a href="/">&larr; {$.Site.title|escape}</a></li>
                <li><a href="#overview">Overview</a></li>
                <li><a href="#keys">API Keys</a></li>
                {if count($paths)}
                    <li>
                        <a href="#paths">Paths</a>
                        <ul>
                            {foreach key=path item=pathData from=$paths}
                                <li><a href="#{unique_dom_id}paths/{$path}{/unique_dom_id}">{$path[0]}{$path|substr:1|replace:'/':'<wbr>/'}</a></li>
                            {/foreach}
                        </ul>
                    </li>
                {/if}
                {if count($definitions)}
                    <li>
                        <a href="#models">Models</a>
                        <ul>
                            {foreach key=model item=modelData from=$definitions}
                                <li><a href="#{unique_dom_id}models//{$model}{/unique_dom_id}">{$model}</a></li>
                            {/foreach}
                        </ul>
                    </li>
                {/if}
                {*<li><a href="#community">Community Code &amp; Uses</a></li>*}
            </ul>
        </div>

        <div
             class="detail-view endpoint-docs"
             data-host="{$host|escape}"
             data-basepath="{$basePath|escape}"
             data-schemes="{$schemes|implode:','|escape}"
             data-handle="{$info['x-handle']|escape}"
             {if $info['x-key-required']}data-key-required{/if}
            >
            <header class="page-header" id="overview">
                <h2 class="header-title"><a href="#overview">{$info.title|escape}</a></h2>
                <div class="header-buttons">
                    <span class="button-group">
                        <label class="muted">Download OpenAPI specification:&nbsp;</label>
                        <a class="button small" href="?format=json">JSON</a>
                        <a class="button small" href="?format=yaml">YAML</a>
                    </span>
                </div>
            </header>

            <div class="markdown">{$info.description|escape|markdown}</div>

            {if count($paths)}
                <section class="page-section" id="paths">
                    <header class="section-header">
                        <h2 class="header-title">Paths</h2>
                    </header>

                    {foreach key=path item=pathData from=$paths}
                        <section class="endpoint-path" id="{unique_dom_id}paths/{$path}{/unique_dom_id}" data-path="{$path}">
                            <header class="section-header">
                                <h3 class="header-title"><a href="#{unique_dom_id}paths/{$path}{/unique_dom_id}">{$path}</a></h3>
                            </header>

                            {foreach key=method item=methodData from=$pathData}
                                <section class="endpoint-path-method indent" id="{unique_dom_id}paths/{$path}.{$method}{/unique_dom_id}" data-method="{$method}">
                                    <header class="section-header">
                                        <h4 class="header-title"><a href="#{unique_dom_id}paths/{$path}.{$method}{/unique_dom_id}"><span class="http-method">{$method}</span> {$path}</a></h4>
                                    </header>

                                    <div class="markdown indent">{$methodData.description|escape|markdown}</div>

    {*                                 <div class="indent"> *}
                                        <table class="docs-table parameters-table">
                                            <caption>Parameters</caption>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Located&nbsp;in</th>
                                                    <th>Description</th>
                                                    <th class="text-center">Required</th>
                                                    <th>Schema</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                            {foreach item=parameterData from=$methodData.parameters}
                                                <tr {html_attributes_encode $parameterData prefix="data-"}>
                                                    <td><code>{$parameterData.name}</code></td>
                                                    <td>{$parameterData.in}</td>
                                                    <td><div class="markdown parameter-description">{$parameterData.description|escape|markdown}</div></td>
                                                    <td class="text-center">{tif $parameterData.required || $parameterData.in == 'path' ? '&#10003;' : '<span class="muted">&mdash;</span>'}</td>
                                                    <td>{definition $parameterData}</td>
                                                </tr>
                                            {/foreach}
                                            </tbody>
                                        </table>

                                        <table class="docs-table responses-table">
                                            <caption>Responses</caption>
                                            <thead>
                                                <tr>
                                                    <th>Code</th>
                                                    <th>Description</th>
                                                    <th>Schema</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                            {foreach key=responseCode item=responseData from=$methodData.responses}
                                                <tr>
                                                    <td>{$responseCode}</td>
                                                    <td><div class="markdown response-description">{$responseData.description|escape|markdown}</div></td>
                                                    <td>{definition $responseData}</td>
                                                </tr>
                                            {/foreach}
                                            </tbody>
                                        </table>
    {*                                 </div> *}
                                </section>
                            {/foreach}
                        </section>
                    {/foreach}
                </section>
            {/if}

            {if count($definitions)}
                <section class="page-section" id="models">
                    <header class="section-header">
                        <h2 class="header-title">Models</h2>
                    </header>

                    {foreach key=definition item=definitionData from=$definitions}
                        <section class="endpoint-model" id="{unique_dom_id}models//{$definition}{/unique_dom_id}">
                            <header class="section-header">
                                <h3 class="header-title"><a href="#{unique_dom_id}models//{$definition}{/unique_dom_id}">{$definition}</a></h3>
                            </header>

                            {if $definitionData.description}
                                <div class="markdown indent">{$definitionData.description|escape|markdown}</div>
                            {/if}

                            {definition $definitionData}
                        </section>
                    {/foreach}
                </section>
            {/if}
        </div>
    </div>
{/block}