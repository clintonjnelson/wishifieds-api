# TODO: Make the db name dynamic, or just use wishifieds, NOT wishifieds dev
# Create the database
echo "Deleting the old DB if exists..."
docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') /bin/sh -c 'dropdb -U postgres wishifieds --if-exists'

echo "Creating the new db"
docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') /bin/sh -c 'createdb -U postgres wishifieds'

# Run the migrations command
./node_modules/.bin/sequelize db:migrate

# Temporary - works for LOCAL ONLY, and shouldn't work for other environments
echo "Migrating the test data"
docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') bash -c 'psql -d wishifieds -U postgres -f /db/dev_base_data.sql'
# docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') bash -c 'psql -d wishifieds -h localhost -U postgres < /db/dev_base_data.sql'


# TODO:
  # Create the user/role & password
  # Assign user/role to the database so not working as admin


# DEBUGGING? Use this to peep into the container & run commands that output on terminal
  # docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') bash -c 'pwd; ls;'
