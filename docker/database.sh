# Create the database
docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') /bin/sh -c 'dropdb -U postgres wishifieds_dev'
docker exec -it $(docker ps | grep db_1 | awk '{ print $1 }') /bin/sh -c 'createdb -U postgres wishifieds_dev'

# Run the migrations command
./node_modules/.bin/sequelize db:migrate

# TODO:
  # Create the user & password
  # Assign user to the database
