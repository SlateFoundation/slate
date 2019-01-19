# slate

A free online foundation for schools.

## Developing

### On Windows

- Install choco, have windows 10 pro
- `choco install docker`
- `choco install habitat`
- `choco install git`
- Clone and `cd` into slate repository
- `$env:HAB_DOCKER_OPTS="-p 7080:7080"`
- `hab studio -D enter`
- Open [http://localhost:7080](http://localhost:7080)

#### Enabling watch mode on Windows

A [workaround](http://blog.subjectify.us/miscellaneous/2017/04/24/docker-for-windows-watch-bindings.html) is needed to make file change notification work under Docker for Windows:

- `choco install python`
- `pip install docker-windows-volume-watcher`
- To enable watch mode for all Docker containers on your system, run in a secondary terminal: `docker-volume-watcher`
- Within each studio, binlink two commands to `/bin` for `docker-volume-watcher`:

    ```bash
    hab pkg binlink core/coreutils -d /bin stat
    hab pkg binlink core/coreutils -d /bin chmod
    ```

## Supporters
These organizations have contributed the resources to make Slate possible:

### Science Leadership Academy
[<img alt="Science Leadership Academy" src="http://scienceleadership.org/img/logo.png" width="100">](http://scienceleadership.org)

### Building21
[<img alt="Building21" src="http://www.b-21.org/wp-content/uploads/2014/08/logo.png" width="250">](http://b-21.org)

### Matchbook Learning
[<img alt="Matchbook Learning" src="http://www.matchbooklearning.com/images/static/logo.png">](http://matchbooklearning.com)

### Jarvus Innovations
[<img alt="Jarvus Innovations" src="http://jarv.us/img/jarvus-logo.svg" width="250">](http://jarv.us)

### TrackJS
[<img src="https://trackjs.com/assets/external/badge.gif" height="40px" alt="Protected by TrackJS JavaScript Error Monitoring" style="border-radius:2px;">](https://trackjs.com/?utm_source=badges)
