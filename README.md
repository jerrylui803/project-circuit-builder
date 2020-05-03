## Project Title
Circuit Builder

## Description of the web application
A circuitry builder web application that lets multiple users (potentially useful for students who are learning about computer organization) to collaborate on drawing logic gates and wires in real time, and also generate the truth table and boolean equation of their circuitry.

## Team Members
* Kevin Zhu
* Jerry Lui
* Kezaram Tharmasegaram

## Video link:
https://youtu.be/o6Ao-2Z74UU 

## How to run?
```
cd circuit-builder
npm install
node app.js

# Go to localhost:3000 in a browser
```

## Deployment URL
https://circuit-builder.me/

## Description of the technologies used:
* HTML 5 Canvas API
* Bootstrap for CSS
* MongoDB for Database
* NodeJS + Express for Backend
* Socket.io for real-time drawing
* REST API + AJAX

## description of the top 3 technical challenges
* Learning to use Canvas. This is mostly because our application relies heavily on the front-end code. This can be seen by the many javascript files dedicated to the app. For example, creating the logic gates, finding their x/y coordinates and updating those positions. Keeping track of connectors, wires, ports were a real learning task for the team. Because we did not have the luxury of using a well-known library or framework like React which simplifies the process, we needed to manually implement some features in native Javascript.

* Real-time update with socketIO with our multi-user system. It needs to only send real-time updates between the correct set of users. There are many edge cases to cover. For example, it needs to handle the case when a user is currently editing a logic diagram but suddenly got unshared from the diagram owner, then this user would not be able to send any future updates to this canvas and stop receiving updates. Furthermore, the real time updates need to ensure consistency of the canvas between different users in case multiple users edit at the same time. 

* Handling logic gate connections and generating truth tables. The user can do anything to the logic diagram, including diagrams that does not have a truth value (for example, a sequential circuit or a flip-flop does not have a truth value). We needed to detect cycles in the graph. We also need to build an expression tree from the graph, then parse the expression tree. Therefore, we were able to the very fun functional programming skills we learned to implement this efficiently.

## How did you deploy your app? What technology did you use?
* We deployed the app using Digital Ocean. It is running on a Ubuntu dedicated virtual private server. We created a domain name using namecheap.com, and we added an SSL certificate using Let’s Encrypt.
