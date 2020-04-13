# Circuit Builder - Web API Documentation
To test below API on deployment, change all instances of http://localhost:3000/ to https://circuit-builder.me/


### CREATE
- description: create a new user
- request: `POST /signup/`
    - content-type: `application/json`
    - body:
        - username: (string) a username to sign-up
        - password: (string) a password to sign-up
- response: 200
    - content-type: `application/json`
    - body: user [user] signed up
- response: 400
    - body: username must contain only alpha-numeric characters.
- response: 400
    - body: Either username or password is empty.
- response: 409
    - body: username [user] already exists
- response: 500

``` 
curl
    -H "Content-Type: application/json" 
    -X POST -d '{"username": "alice", "password": "12345"}' -c cookie.txt
    http://localhost:3000/signup/
```




### CREATE
- description: sign in to application
- request: `POST /signin/`
    - content-type: `application/json`
    - body:
        - username: (string) a username to sign-in
        - password: (string) a password to sign-in
- response: 200
    - content-type: `application/json`
    - body: user [user] signed in
- response: 400
    - body: username must contain only alpha-numeric characters.
- response: 401
    - body: access denied
- response: 500

``` 
curl
    -H "Content-Type: application/json" 
    -X POST -d '{"username": "alice", "password": "12345"}' -c cookie.txt
    http://localhost:3000/signin/
```



### CREATE
- description: create a new diagram
- request: `POST /api/canvas/`
    - content-type: `application/json`
    - body:
        - title: (string) diagram title
- response: 200
    - content-type: `application/json`
    - body: title [title] created
- response: 400
    - body: title must contain only alpha-numeric characters.
- response: 401
- response: 409
    - body: username [user] already has a diagram titled [title].
- response: 500

``` 
$ curl -b cookie.txt -X POST
       -H "Content-Type: application/json"
       -d '{"title": "Test"}'
       http://localhost:3000/api/canvas/
```





### CREATE
- description: return a diagram's detailed info of components
- request: `POST /api/canvas/data/:owner/:title`
    - content-type: `application/json`
    - body:
        - owner: (string) diagram author
        - title: (string) diagram title
- response: 200
    - content-type: `application/json`
    - body: object
        - connHandler: (object) list of connectors
        - wireHandler: (object) list of wires
        - gateHandler: (object) list of gates
        - portHandler: (object) list of ports
- response: 400
    - body: owner must contain only alpha-numeric characters.
- response: 400
    - body: title must contain only alpha-numeric characters.
- response: 401
    - body: access denied
- response: 500

``` 
$ curl -b cookie.txt -X POST
       -H "Content-Type: application/json"
       http://localhost:3000/api/canvas/data/alice/Test/
```




### CREATE
- description: create a new share object with another user
- request: `POST /api/user/share`
    - content-type: `application/json`
    - body: object
        - title: (string) the title of the diagram being shared
        - targetUsername: (string) the name of the shared user
- response: 200
    - content-type: `application/json`
- response: 400
    - body: title must contain only alpha-numeric characters.
- response: 400
    - body: target username must contain only alpha-numeric characters.
- response: 401
- response: 500

``` 
$ curl -b cookie.txt -X POST
       -H "Content-Type: application/json"
       -d '{"title": "Test", "targetUsername": "yellow"}'
       http://localhost:3000/api/user/share/
```


### CREATE
- description: return the number of shares for a diagram
- request: `POST /api/size/share`
    - content-type: `application/json`
    - body: object
        - title: (string) the title of the diagram being shared
- response: 200
    - content-type: `application/json`
    - body: object
        - size: (int) number of shares
- response: 400
    - body: title must contain only alpha-numeric characters.
- response: 401
- response: 500

``` 
$ curl -b cookie.txt -X POST
       -H "Content-Type: application/json"
       -d '{"title": "Test"}'
       http://localhost:3000/api/size/share/
```


### CREATE
- description: return a subset of shared diagram info
- request: `POST /api/user/unshare/:startIndex/:userLength`
    - content-type: `application/json`
    - body:
        - startIndex: (int) starting share #
        - userLength: (int) # of users
- response: 200
    - content-type: `application/json`
    - body: list of objects
        - owner: (string) diagram author name
        - title: (string) diagram title
        - shareUsername: (string) user being shared with
- response: 400
    - body: Please enter startIndex and userLength as integers.
- response: 401
    - body: access denied
- response: 500

``` 
$ curl -b cookie.txt -X POST
       -H "Content-Type: application/json"
       http://localhost:3000/api/user/unshare/0/1/
```


### READ
- description: sign out of application
- request: `GET /signout/`
- response: 200
    - content-type: `application/json`
    - body: Found. Redirecting to /
- response: 401
    - body: access denied

``` 
$ curl -b cookie.txt http://localhost:3000/signout/
```


### READ
- description: return the total number of editable diagrams that you have
- request: `GET /api/size/canvas`
- response: 200
    - content-type: `application/json`
    - body: object
        - size: (int) the editable canvas count
- response: 401
- response: 500

``` 
$ curl -b cookie.txt http://localhost:3000/api/size/canvas/
```




### READ
- description: return a set of existing diagrams you have
- request: `GET /api/canvas/title/:startIndex/:canvasLength`
    - body:
        - startIndex: (int) diagram # to start
        - canvasLength: (int) # of diagrams wanted
- response: 200
    - content-type: `application/json`
    - body: list of object
        - owner: (string) the diagram owner
        - title: (string) the name of the diagram
- response: 400
    - body: Please enter startIndex and canvasLength as integers.
- response: 401
- response: 500

``` 
$ curl -b cookie.txt http://localhost:3000/api/canvas/title/0/1/
```



### DELETE
- description: delete an existing diagram where you are the owner
- request: `DELETE /api/canvas/data/:title`
    - body:
        - title: (string) name of diagram to delete
- response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) hash of diagram
        - owner: (string) diagram owner
        - title: (string) name of diagram
        - canvas: (object) canvas info such as connector, wire, gate and port details

- response: 400
    - body: title must contain only alpha-numeric characters.
- response: 401
- response: 404
    - body: the diagram does not exist

``` 
$ curl -b cookie.txt -X DELETE
       http://localhost:3000/api/canvas/data/Test/
```



### DELETE
- description: unshare a particular diagram with another user
- request: `DELETE /api/canvas/unshare/:title/:shareUsername`
    - body: 
        - title: (string) name of diagram to unshare
        - shareUsername: (string) name of person to unshare the diagram with
- response: 200
    - content-type: `application/json`
    - body:
        - _id: (string) hash of diagram
        - owner: (string) diagram owner
        - title: (string) name of diagram
        - shareUsername: (string) name of diagram
- response: 400
    - body: title must contain only alpha-numeric characters.
- response: 400
    - body: share username must contain only alpha-numeric characters.
- response: 401
- response: 404
    - body: the diagram does not exist

``` 
$ curl -b cookie.txt -X DELETE
       http://localhost:3000/api/canvas/unshare/Test/alice/
```






### Socket IO
- ['http://localhost:3000/']
- [socket.on('upload canvas')]
    - Uploads diagram info to server -> gates, wires, connectors, last gateID, last connectorID.
- [socket.emit('broadcast canvas')]
    - Broadcasts diagram info to all sharing individuals -> gates, wires, connectors, last gateID, last connectorID.
- [socket.on('switch canvas')]
    - Switches to new room with new diagram info -> gates, wires, connectors, last gateID, last connectorID.

