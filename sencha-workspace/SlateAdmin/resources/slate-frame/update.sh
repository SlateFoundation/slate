#!/bin/bash


wget http://v2.slate.is/css/main.css -O main.css

mkdir img
wget http://v2.slate.is/img/slate-logo-white.svg -O img/slate-logo-white.svg
wget http://v2.slate.is/img/slate-icons/slate-icons.svg -O img/slate-icons.svg

mkdir fonts
wget http://v2.slate.is/css/fonts/lato.css -O fonts/lato.css
wget http://v2.slate.is/css/fonts/sanchez.css -O fonts/sanchez.css
wget http://v2.slate.is/css/fonts/font-awesome.css -O fonts/font-awesome.css
