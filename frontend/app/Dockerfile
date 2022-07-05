# pull the Node.js Docker image  from Docker Hub
FROM node:12.18-alpine

# create the directory inside the container. Set the working directory that is used inside the container (usr/src/app is the standard for Node.js apps)
WORKDIR /usr/src/app
#/home/usrmodipi01/modipi_2022/fte_MDP/modipi-estadistica-app/backend

# /usr/src/app

# copy the package.json files from local machine to the workdir in container
COPY ["package.json", "package-lock.json", "npm-shrinkwrap.json*", "./"]  
#   COPY package.json /usr/src/app/
# 
# run npm install in our local machine
RUN npm install 
#--production --silent && mv node_modules ../
ENV NODE_ENV development
# copy the generated modules and all other files to the container,  to the working directory (including node_modules)
COPY . . 
  #  COPY . /usr/src/app

# our app is running on port 5000 within the container, so need to expose it. Expose port 5000. The app is running on port 5000 inside the container, so we can’t view it on our browser unless we expose the port
EXPOSE 5000

# the command that starts our app. Tell the image what command to run when the container is started
CMD ["npm","run",  "serve"]

