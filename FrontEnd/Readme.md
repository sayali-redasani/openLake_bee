# BEE Movie Chatbot

## Description
This is a BEE movie chatbot that performs sentiment analysis and responds to queries based on the movie.

## Installation
To install the project dependencies, run:
```bash
npm install
```

## Usage
To run the project, execute the following command:
```bash
npm start
```
## Docker Image
```bash
docker pull sayli98/openlake:v1
```
## Usage
```bash
docker run -p 3000:3000 sayli98/openlake:v1
```

### Note : 
Update your ASR API_KEY ASR inside file Home.js present inside pages/Home folder

#### Steps for getting API key
1. Sign in to Azure: Access the Azure portal using your Microsoft account. 
2. Create a Speech resource:
3. Go to "Create a resource" and search for "Speech Services". 
4. Select a subscription and resource group. 
5. Provide a name for your Speech resource. 
6. Get your API key and region:
7. Once the resource is created, go to its details page. Locate your subscription key and the region associated with your Speech service. 
