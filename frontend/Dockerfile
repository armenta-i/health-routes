FROM node:18-alpine

WORKDIR /app

# Copy entire project first
COPY . .

# Clean install to ensure all dependencies are fresh
RUN rm -rf node_modules
RUN npm cache clean --force

# Install dependencies explicitly
RUN npm install
RUN npm install react-native-safe-area-context@4.12.0 --save
RUN npm install @react-navigation/native --save
RUN npm install expo --save
RUN npm install -g expo@52.0.46

EXPOSE 8081
EXPOSE 19000
EXPOSE 19001

# For debugging purposes, let's check if the package is actually installed
# RUN ls -la node_modules/react-native-safe-area-context

CMD ["npm", "run", "web"]