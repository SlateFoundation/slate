# slate

An open-source foundation for schools

## Maturity
Slate is stable and has been used in production at pilot schools for over 5 years. This current open-source release however is only recommended for trial use by developers as breaking changes may need to be made over the next few minor versions as we work towards a 1.0 release.

## Requirements
Slate is built on the Emergence PHP framework and deployement engine, and requires an Emergence server to host it.

Emergence takes just a few minutes to setup on a Linux VM, and is designed to have a fresh system to itself. Once launched
it will configure services on the machine as-needed to host an instance of the application along with any other
sites, clones, or child sites. The guides for Ubuntu 13.04/13.10 and Gentoo are most up-to-date: http://emr.ge/docs/setup

### Why Emergence?
Emergence follows a design philosophy distinct from existing PHP frameworks that prioritizes the ease and stability of customizing, extending, and resharing an application. Schools have diverse needs and levels of expertise available and it is important that any aspect of their system be customizable without needing to entirely fork away from the mainstream releases. Emergence will also facilitates the evolution of sub-distributions of Slate that cater to common school environments.

## Installation via Emergence (linked child) - Recommended
-  Create an emergence site that extends http://o9B11mbIXY1proH7@v1.slate.is

This video walks through the complete process of installing emergence and then instantiating the GateKeeper application:
[![Walkthrough Video](http://b.vimeocdn.com/ts/455/313/455313620_640.jpg)](https://vimeo.com/79587819)

## Installation from Git
-  Create an emergence site that extends http://8U6kydil36bl3vlJ@skeleton.emr.ge
-  Upload contents of git repository using WebDAV client (CyberDuck is the best open-source option)
