#!/bin/bash

# packages
apt -y update
apt -y install git
apt -y install gcc
apt -y install nodejs-legacy
apt -y install build-essential

# folder
rm -R /home/serv
mkdir /home/serv
cd /home/serv
mkdir /home/d

# source
git clone https://github.com/operezcham90/concurso-programacion.git app
npm install

# done
echo "Main folder: /home/serv"
echo "Current IP address:"
hostname -I