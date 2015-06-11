# Clone Slate from git
This guide is for developers who want to work on Slate's core code. It will walk you through
setting up a fresh site instance and cloning a version of Slate into it from a remote git
repository.

## Obtain an emergence host
You will need a host server dedicated to running emergence. If you don't have access to one already,
the easiest way to get started is to spin up a small **Ubuntu 14.04 LTS** virtual machine with a cloud
provider like Digital Ocean, Google Cloud Compute, AWS, or countless others. Once you are logged in
to your fresh Ubuntu 14.04 machine, follow [emergence's installation guide](emr.ge/docs/setup/ubuntu/14.04)
to prepare it for hosting emergence-powered sites like Slate.

## Create a site
Slate is based on emergence's `skeleton-v2` site template. Unlike when provising a deployment
instance of Slate, for development you want to create a site extending Slate's parent
site rather than Slate itself. Slate's code will be checked out via git, and it would be
messy to do that on top of another instance (and ossibly different version) of Slate.

Use emergence's host control panel to create a new site with your desired hostname and initial user, just
be sure to select `skeleton-v2.emr.ge` as the parent hostname. After the site is created login to <kbd>/develop</kbd>
with your initial user developer account.

## Configure git link
To configure a link with a git repository, create a file called <kbd>Git.config.php</kbd> in the top level of the
`php-config` directory and copy its initial contents from the [latest version of Slate's development Git.config.php](https://github.com/SlateFoundation/slate/blob/development/php-config/Git.config.php)
on Github.

You may change `originBranch` to select a different source and change `workingBranch` to change which branch you'll
be initially setup to commit to (both can be set to the same thing.)

See the [emergence manual page on git integration](http://emr.ge/docs/git/init) for full details on all the configuration
options.

## Initialize git links
Visit <kbd>/git/init?repo=slate</kbd> to initialize the link with the configured git repository. If you are
cloning via HTTPS or don't need to push changes back to origin from the web interfaces, you can leave the deploy key field
empty and skip setting one up. Without a deploy key you will need to SSH into the server and use the git CLI to push changes.
[Setting up a deploy key](http://emr.ge/docs/git/init) will enable you to use emergence's (currently minimal) web interface
for commiting/pushing changes.

Repeat this process for <kbd>/git/init?repo=slate-admin</kbd> and <kbd>/git/init?repo=slate-theme</kbd> as well if you'll be working on them.

## Import code from git
Visit <kbd>/git/import?repo=slate</kbd> to pull the git tree into your emergence site.

Repeat this process for <kbd>/git/import?repo=slate-admin</kbd> and <kbd>/git/import?repo=slate-theme</kbd> as well if you'll be working on them.

## Execute initial builds
Your site will work at this point, but the production views of pages will be missing Slate's extensions to
skeleton-v2`s frontend CSS and JS that go through a build process.

- Compile CSS by going to <kbd>/sass/compile</kbd>
- Compile JS by going to <kbd>/sencha-cmd/pages-build</kbd> (this one will take a while on your first
run as the ExtJS framework sources are downloaded -- just let it keep spinning and find something else to do for a bit)
- Compile SlateAdmin going to <kbd>/sencha-cmd/app-build?name=SlateAdmin</kbd> (this one will take a while on your first
run as the ExtJS framework sources are downloaded -- just let it keep spinning and find something else to do for a bit)