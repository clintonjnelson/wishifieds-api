FROM node:8.9.4

# /app as workdir
RUN mkdir /app
ADD . /app
# ADD ./db/setup_db.sql /db
WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install -g foreman
RUN npm install --quiet

# WHY COPY LAST?????
COPY . .
# COPY ./docker-entrypoint.sh /
# ENTRYPOINT ["/docker-entrypoint.sh"]
