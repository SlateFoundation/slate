{extends designs/site.tpl}

{block "title"}{$info.title|escape} &mdash; {$dwoo.parent}{/block}

{block "branding"}{/block}
{block "header-bottom"}{/block}
{block "footer-top"}{/block}
{block "footer"}{/block}

{block "content"}
    <?php
        // flatten all $refs in document ahead of rendering
        $this->scope = Emergence\OpenAPI\Reader::flattenAllRefs($this->scope);
    ?>

    {template definition input definitionId=null}
        {$schema = default($input.schema, $input)}
        {$definitionId = default($definitionId, Emergence\OpenAPI\Reader::getDefinitionIdFromPath($schema._resolvedRef))}

        {if $schema.properties}
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
                {foreach key=property item=propertyData from=$schema.properties}
                    <tr>
                        <td><code>{$property}</code></td>
                        <td class="text-center">{tif is_array($schema.required) && in_array($property, $schema.required) ? '&#10003;' : '<span class="muted">&mdash;</span>'}</td>
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
            {if $schema.type == 'array'}
                [array] {definition $schema.items}
            {else}
                {$schema.type}
                {if $schema.format}
                    ({$schema.format})
                {/if}
                {if $schema.enum}
                    (enum)
                    <ul>
                        {foreach item=value from=$schema.enum}
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
                {if count($components.schemas)}
                    <li>
                        <a href="#models">Models</a>
                        <ul>
                            {foreach key=model item=modelData from=$components.schemas}
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
             data-servers="{foreach implode="," item=server from=$servers}{$server.url|escape}{/foreach}"
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
                                        <h4 class="header-title"><a href="#{unique_dom_id}paths/{$path}.{$method}{/unique_dom_id}"><span class="http-method">{$method|upper}</span> {$path}</a></h4>
                                    </header>

                                    <div class="markdown indent">{$methodData.description|default:$methodData.summary|escape|markdown}</div>

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

                                        {if $methodData.requestBody}
                                            <table class="docs-table request-body-table">
                                                <caption>Request Body {if $methodData.requestBody.required}(Required &#10003;){/if}</caption>
                                                <thead>
                                                    <tr>
                                                        <th>Type</th>
                                                        <th>Schema</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                {foreach key=contentType item=contentData from=$methodData.requestBody.content}
                                                    <tr {html_attributes_encode $parameterData prefix="data-"}>
                                                        <td>{$contentType|escape}</td>
                                                        <td>{definition $contentData}</td>
                                                    </tr>
                                                {/foreach}
                                                </tbody>
                                            </table>
                                        {/if}

                                        <table class="docs-table responses-table">
                                            <caption>Responses</caption>
                                            <thead>
                                                <tr>
                                                    <th>Code</th>
                                                    <th>Description</th>
                                                    <th>Type</th>
                                                    <th>Schema</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                            {foreach key=responseCode item=responseData from=$methodData.responses}
                                                {foreach name=contentTypes key=contentType item=contentData from=$responseData.content}
                                                    <tr>
                                                        {if $.foreach.contentTypes.first}
                                                            <td rowspan="{$.foreach.contentTypes.total}">{$responseCode}</td>
                                                            <td rowspan="{$.foreach.contentTypes.total}">
                                                                <div class="markdown response-description">
                                                                    {$responseData.description|escape|markdown}
                                                                </div>
                                                            </td>
                                                        {/if}
                                                        <td>{$contentType|escape}</td>
                                                        <td>{definition $contentData}</td>
                                                    </tr>
                                                {foreachelse}
                                                    <tr>
                                                        <td>{$responseCode}</td>
                                                        <td colspan="3">
                                                            <div class="markdown response-description">
                                                                {$responseData.description|escape|markdown}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                {/foreach}
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

            {if count($components.schemas)}
                <section class="page-section" id="models">
                    <header class="section-header">
                        <h2 class="header-title">Models</h2>
                    </header>

                    {foreach key=definition item=definitionData from=$components.schemas}
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