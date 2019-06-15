#!/bin/bash
set -e

docker-compose up -d

until pg_isready -h 127.0.0.1 -d wishifieds
do
  echo "."
  sleep 1
done

echo "Wait for usual pg restart..."
sleep 2
echo "...should be ready now."

# TODO: Make the db name dynamic, or just use wishifieds, NOT wishifieds dev

# Create the database
echo "Deleting the old DB if exists..."
docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') /bin/sh -c 'dropdb -U postgres wishifieds --if-exists'

echo "Creating the new db"
docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') /bin/sh -c 'createdb -U postgres wishifieds'

# Run basic DB setup script
echo "Setting up database...."
docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') /bin/sh -c 'psql -d wishifieds -U postgres -f /db/seeders/db_setup.sql'

# Run the migrations command
./node_modules/.bin/sequelize db:migrate

# Temporary - works for LOCAL ONLY, and shouldn't work for other environments
echo "Migrating the test data"
docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') bash -c 'psql -d wishifieds -U postgres -f /db/seeders/base_us_zipcode_locations.sql'
docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') bash -c 'psql -d wishifieds -U postgres -f /db/seeders/dev_base_data.sql'
#docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') bash -c 'psql -d wishifieds -h localhost -U postgres < /db/dev_base_data.sql'


# TODO:
  # Create the user/role & password
  # Assign user/role to the database so not working as admin


# DEBUGGING? Use this to peep into the container & run commands that output on terminal
  # docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') bash -c 'pwd; ls;'
