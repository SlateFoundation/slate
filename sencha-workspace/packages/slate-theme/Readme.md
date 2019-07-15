# slate-theme - Read Me

## Installation
1. Clone into workspace packages directory
2. Set `"theme": "slate-theme"` in your app's app.json
3. Until Sencha resolves [this issue with themes using `inline-image`](https://www.sencha.com/forum/showthread.php?286900), add to your app's build.xml:
```
    <!-- TODO: remove this hack to make inline-images work, see https://www.sencha.com/forum/showthread.php?286900 -->
    <target name="-before-sass">
        <mkdir dir="${build.sass.dir}" />
        <symlink link="${build.sass.dir}/images" resource="${build.resources.dir}/images" failonerror="false" />
    </target>
```
