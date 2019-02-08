# slate

Slate is a free and open online foundation for schools. It is designed to empower students, teachers, and administrators to craft the digital commons of their learning environment from the ground up.

Inspired by Science Leadership Academy founding principal Chris Lehmann's belief that [technology \[in schools\] needs to be like oxygen: ubiquitous, necessary, and invisible](https://www.youtube.com/watch?v=RUWzQYLqLLg), the first version of Slate was launched there in 2010. Since then, dozens of schools and networks of schools have contributed to and built on top of Slate.

Slate isn't a hot new startup or the next tool that does everything. It's an online home base that anchors the shared experience and evolves in place while your learners and educators explore new tools and practices. It's the glue that frees you to plug in and unplug new things others have built, and even build things yourself when you are ready. It's the operating system for your school that belongs to your school and serves no interest but your community's.

## Getting started

There are three ways to get started with Slate:

- [Contract Jarvus to set you up](https://jarv.us/education)
- Ask your [local Code for America brigade](http://brigade.codeforamerica.org/) for help
- [Clone slate](#cloning-slate) to work on and contribute to its core, shared functionality
- [Extend slate](#extending-slate) to create a workspace for customizing a copy of Slate for your school without forking the whole thing

### Dependencies

Slate's uses [Habitat](https://www.habitat.sh/) to provide its development, build, and runtime environments and is the only dependency you need to worry about. Habitat in-turn requires [Docker](https://www.docker.com/) on Mac and Windows workstations to do its thing, and can optionally make use of it on Linux.

#### Ubuntu Linux

- Use aptitude to install Git and Docker:

    ```bash
    sudo apt install -y git apt-transport-https ca-certificates curl software-properties-common

    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
    sudo apt update

    sudo apt install -y docker-ce
    ```

- Use habitat's bootstrap script to install habitat with habitat:

    ```bash
    curl https://raw.githubusercontent.com/habitat-sh/habitat/master/components/hab/install.sh | sudo bash
    ```

#### Mac

- Install [Homebrew](https://brew.sh/)
- Use Homebrew to install Git, Docker, and Habitat:

    ```bash
    brew install git
    brew cask install docker
    brew tap habitat-sh/habitat
    brew install hab
    ```

#### Windows 10 Pro

- "Pro" edition is required by Docker for its virtualization support
- Install [Chocolatey](https://chocolatey.org/)
- Use Chocolatey to install Git, Docker, and Habitat:

    ```powershell
    choco install git
    choco install docker
    choco install habitat
    ```

### Set up Source Code Repository

#### Cloning Slate

To play with or work on Slate's core:

```bash
# clone and change into the slate repository
git clone https://github.com/SlateFoundation/slate
cd slate
```

#### Extending Slate

To start building your own environment that sits on top of Slate:

```bash
# clone and change into the slate repository
git clone https://github.com/SlateFoundation/slate-starter jawnsburghigh
cd jawnsburghigh
```

*TODO: set up `slate-starter` repository*

### Launch Developer Studio

The developer studio is a disposable command-line environment for working on the project. Habitat puts it together for you and provides all the packages within it, giving you a lightweight development experience that works consistently across machines and platforms.

#### Linux / Mac

```bash
# expose port 7080 from any Docker container started by Habitat
export HAB_DOCKER_OPTS="-p 7080:7080"

# launch and enter a Habitat studio
hab studio enter
```

#### Windows

```powershell
# expose port 7080 from any Docker container started by Habitat
$env:HAB_DOCKER_OPTS="-p 7080:7080"

# launch and enter a Habitat studio, forcing it to be a Docker studio instead a Windows native studio
hab studio -D enter
```

### Run and Edit Slate

```bash
# once the studio has finished loading, start all services with a local database
start-all-local

# build and load the site, then wait for file changes
watch-site
```

At that point you should be able to see an instance at http://localhost:7080 and any edits should be reflected live

**Note for Windows users:** [a workaround](https://gist.github.com/themightychris/8a016e655160598ede29b2cac7c04668) is currently required for file watching to work under Docker for Windows

## Support

- [Slate forum/wiki](http://forum.slate.is/)
- [Slate issues on GitHub](https://github.com/SlateFoundation/slate/issues)
- [Emergence forum/wiki](http://forum.emr.ge)

## Features

*TODO: list features*

## Supporters

These organizations have contributed the resources to make Slate possible:

### Science Leadership Academy

[<img alt="Science Leadership Academy" src="http://scienceleadership.org/img/logo.png" width="100">](http://scienceleadership.org)

### Building21

[<img alt="Building21" src="http://building21.org/wp-content/uploads/2017/04/logo_retina.png" width="250">](http://b-21.org)

### Matchbook Learning

[<img alt="Matchbook Learning" src="http://www.matchbooklearning.com/images/static/logo.png">](http://matchbooklearning.com)

### Jarvus Innovations

[<img alt="Jarvus Innovations" src="http://jarv.us/img/jarvus-logo.svg" width="250">](http://jarv.us)

### TrackJS

[<img src="https://trackjs.com/assets/external/badge.gif" height="40px" alt="Protected by TrackJS JavaScript Error Monitoring" style="border-radius:2px;">](https://trackjs.com/?utm_source=badges)
