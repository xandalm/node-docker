# syntax=docker/dockerfile:1

FROM node:16.14

WORKDIR /api

COPY ["package.json","package-lock.json","./"]

RUN npm install --production=false
# RUN npm install -g --save-dev jest
# RUN npm install -g --save-dev babel-jest

# Prepare project to generate package.json and package-lock.json files using nodejs cloud image if this files not exists or for update dependêncies
# Comment the COPY instruction and the two RUN instructions above
# Uncomment the two RUN instructions below
# After, run image as a container and copy package.json/package-lock.json files from container. Use docker command 'docker cp <CONTAINER-ID>:<WORKDIR>/<filepath> <destiny>'
# Example command: "docker cp 99cef66f2d7d:api/package.json ." (obs: this dot is workdir from local machine 'node-docker' folder in this case)

# RUN npm init -y
# RUN npm install --save mysql dotenv express express-graphql graphql

COPY ["src", "./"]

# CMD ["node", "server.js"]
