# I DO NOT THINK ANY OF THIS IS IN THE RIGHT PLACE BECAUSE THIS IS RELATED TO THE DB BUT THIS
#   DOCKERFILE IS FOR THE APP ONLY. PUT THE DB SETUP IN THE DOCKER COMPOSE OR A SCRIPT.
# HERE"S THE PROBLEM:
  # 1. The database has to be started up
  # 2. Then the app (Sequelize) needs to run migrations (can we do this via script)
  # 3. Then the rest of the migrations need to run
su apt-get install sudo


echo "Deleting the old DB if exists..."
dropdb -U postgres wishifieds --if-exists

echo "Creating the new db"
createdb -U postgres wishifieds

echo "Setting up database...."
psql -d wishifieds -U postgres -f /db/db_setup.sql

# echo "Enabling super user..."
# su -
# echo "...enabled"

echo "Preparing image by running 'apt-get update' && install npm..."
/usr/bin/sudo apt-get update && apt-get install npm
echo "...updated & Installed."
# echo "Installing NPM for sequelize..."

echo "Installing sequelize globally via npm..."
npm install -g sequelize
echo "Installing sequelize-cli globally via npm..."
npm install -g sequelize-cli
echo "Running migrations via sequelize..."
npx sequelize db:migrate

echo "Running DB migrations..."
/db/.bin/sequelize db:migrate

echo "Run custom data migration setup script for generic UAT data"
psql -d wishifieds -U postgres -f /db/dev_base_data.sql

echo "Run locations data population script..."
psql -d wishifieds -U postgres -f /db/base_us_zipcode_locations.sql
