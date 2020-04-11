
How to run?
```
cd circuit-builder
npm install
nodemon app.js
#Then open up localhost:3000 in a browser
```


# Circuit Builder - Web API Documentation



-/api/canvas
### CREATE

- description: inserts a new diagram for a user
- request: `POST /api/canvas/`
    - content-type: `application/json`
    - body: object
      - owner: (string) the owner of the diagram
      - title: (string) the title of the diagram

- response: 200
    - content-type: `application/json`

- response: 409
    - body: username [user] already has a diagram titled [title].
- response: 500

``` 
$ curl -b cookie.txt -X POST
       -H "Content-Type: application/json"
       -d '{"owner":"alice", "title":"Test"}
       http://localhost:3000/api/canvas/
```








-/api/canvas/data/:owner/:title
### Create

- description: return a diagram's info
- request: `POST /api/canvas/data/:owner/:title`
    - content-type: `application/json`

- response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) diagram id
        - owner: (string) diagram author name
        - title: (string) diagram title
        - canvas: (string)

- response: 404 (NEED TO ADD)
- response: 500

``` 
$ curl -b cookie.txt -X POST
       -H "Content-Type: application/json"
       http://localhost:3000/api/canvas/data/alice/Alice/
```







-/api/user/share
### Create
- description: create a new share object for a user
- request: `POST /api/user/share`
    - content-type: `application/json`
    - body: object
      - title: (string) the title of the diagram being shared
      - targetUsername: (string) the name of the shared user

- response: 200
    - content-type: `application/json`

- response: 409
    - body: username [user] already has a diagram titled [title].
- response: 500

``` 
$ curl -b cookie.txt -X POST
       -H "Content-Type: application/json"
       -d '{"title":"Alice", "targetUsername": "yellow"}'
       http://localhost:3000/api/user/share/
```







-/signup
### Create
- description: create a new user
- request: `POST /signup/`
    - content-type: `application/json`

- response: 200
    - content-type: `application/json`
    - body: user [user] signed up

- response: 409
    - body: username [user] already exists
- response: 500

``` 
curl
    -H "Content-Type: application/json" 
    -X POST -d '{"username":"alice","password":"123"}' -c cookie.txt
    http://localhost:3000/signup/
```






-/signin
### Create
- description: sign in to application
- request: `POST /signin/`
    - content-type: `application/json`

- response: 200
    - content-type: `application/json`
    - body: user [user] signed in

- response: 401
    - body: access denied
- response: 500

``` 
curl
    -H "Content-Type: application/json" 
    -X POST -d '{"username":"alice","password":"123"}' -c cookie.txt
    http://localhost:3000/signin/
```







-/signout
### Read
- description: sign out of application
- request: `GET /signout/`

- response: 200
    - content-type: `application/json`
    - body: Found. Redirecting to /

- response: 401
    - body access denied

``` 
$ curl -b cookie.txt http://localhost:3000/signout/
```






-/api/size/canvas
### READ
- description: return the total number of editable canvas for the current user
- request: `GET /api/size/canvas`

- response: 200
    - content-type: `application/json`
    - body: object
      - size: (int) the editable canvas count

- response: 500
- response: 401 access denied (NEED TO ADD)

``` 
$ curl -b cookie.txt http://localhost:3000/api/size/canvas/
```






-/api/canvas/title/:startIndex/:canvasLength
### READ
- description: return a set of existing canvas diagrams for a user
- request: `GET /api/canvas/title/:startIndex/:canvasLength`

- response: 200
    - content-type: `application/json`
    - body: list of objects
      - owner: (string) the diagram owner
      - title: (string) the name of the diagram

- response: 500
- response: 401 - access denied (NEED TO ADD)
- response: 404 - diagrams not found (NEED TO ADD)

``` 
$ curl -b cookie.txt http://localhost:3000/api/canvas/title/0/1/
```





-/api/canvas/data/:owner/:title
### DELETE
- description: delete an existing diagram
- request: `DELETE /api/canvas/data/:owner/:title`
- response: 200
    - content-type: `application/json`
- response: 401
- response: 404

``` 
$ curl -b cookie.txt -X DELETE
       http://localhost:3000/api/canvas/data/alice/Picture
```





### Socket.io
['http://localhost:3000/']
[socket.on('upload canvas')]
    - returns gates, wires, connectors, last gateID, last connectorID

[socket.emit('broadcast canvas')]
    - returns gates, wires, connectors, last gateID, last connectorID

