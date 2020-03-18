### Team Members
* Kevin Zhu
* Jerry Lui
* Kezaram Tharmasegaram
 
### Project Title
Circuit Builder

### Description of the web application
A real-time circuitry builder that lets users (potentially useful for CSCB58 students) to draw wires and logic gates, and also get the truth table of their circuitry. This application will use a grid system to let the user place logic gates and wires by drag and drop.
 
### Description of the key features that will be completed by the Beta version
Will complete:
* Real-time drawing of circuitry supporting up to 2 users (this includes the grid system and a menu option to select widgets such as wires and logic gates). (Only this feature completed by beta version because we expect this to be the most challenging part, do you think it is a good timeline?)
 
### Description of additional features that will be completed by the Final version
* Compute the truth table of the circuitry built
* Convert circuitry into the simplified equation
* User signup/signin/signout 
* Store circuitry previously created by the user into the database
* (Possible extra feature) support more than 2 users to draw at the same time

### Description of the technology that you will use
* Frontend framework - React
* Frontend framework - Socket.io
* Database - MongoDB
* Backend framework - NodeJS/Express
* GraphQL
* (possible extra feature) Login Authentication API with FB, Google
 
### description of the top 5 technical challenges
* Figuring out real-time syncing between 2 users (We expect this to be the most challenging one)
* Learning React
* Truth table simulation
* Equation simplifier
* Creating the Grid System: 
	* Need a way to read the circuit, into something that can be inputted into the truth table simulation algorithm and equation simplifier
	* Scaling of grid system (if the user needs extra space to extend his/her circuit)
