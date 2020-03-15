class WireManager{
    constructor(){
        wires = [];
        this.hover = null;
        this.drawing = false;
        this.invalid = null;
    }

    //Checks if a wire can be started from this connection
    //A wire can be started iff:
    //the connector is an output type
    //the connector is an input type and has no other wires connected
    checkConnectable(connector){
        if(connector.type == CType.OUT){
            return true;
        }
        //Input type connector, check if it has any wires already connected
        else{
            //Loop through all wires, check if this connector already has wire
            for(let i = 0; i < wires.length; i++){
                let curr = wires[i]
                //If connector already has a connection
                //This only works because the current drawn wire is not in wires[]
                //If it is there is possibility of null ptr!!!!
                if(curr.start.connectorID == connector.connectorID){
                    return false;
                }
            }
        }
        return true;
    }
    //Checks if joining a wire at a given connection is valid.
    //A wire is valid iff:
    //the wire does not connect to any other connections with the same gateID
    //the wire connects to its opposite type (output to input, or input to output)
    //the connection has no wires already connected if it is of type input
    checkValid(wire, connector){
        //Wire is the wire we want to connect to potential connector
        let conGateID = connector.gateID;
        let wireStart = null;
        if(wire.start){
            wireStart = wire.start; //start is of type connector
        }
        else{
            wireStart = wire.end; //end is of type connector
        }
        let wireGateID = wireStart.gateID;
        //Check if wire connects to any other connections with same gateID as itself
        if(conGateID == wireGateID){
            return false;
        }
        //Check if the wire connents to its opposite type
        if(wireStart.type == connector.type){
            return false;
        }
        //Check if the connection already has a wire
        return this.checkConnectable(connector);
    }
    //Checks if a wire is being joined to its own start, if this happens it is
    //assumed that the user does not want to draw a wire
    checkCancel(wire, connector){
        let wireStart = null;
        if(wire.start){
            wireStart = wire.start; //start is of type connector
        }
        else{
            wireStart = wire.end; //end is of type connector
        }
        return (wireStart.connectorID == connector.connectorID);
    }

    handleMouseDown(){
        if(tool == "EDGE"){
            //Find out which connector the user is trying to draw a wire from.
            //Loop through all connector nodes
            //If not drawing currently, then start drawing, create new wire
            if(!this.drawing){
                for(var key in connectors){
                    if(connectors.hasOwnProperty(key) && 
                    connectors[key].checkMouseHitbox() && 
                    this.checkConnectable(connectors[key])){
                        //If wire is being drawn backwards (output to input)
                        //switch the start and end connectors
                        if(connectors[key].type == CType.IN){
                            this.hover = new Wire(connectors[key], null);
                        }
                        else{
                            this.hover = new Wire(null, connectors[key]);
                        }
                        console.log("creating new wire at",connectors[key]);
                        this.drawing = true;
                        break;
                    }   
                }
            }
            else{
                let cancel = true;
                for(var key in connectors){
                    if(connectors.hasOwnProperty(key) && connectors[key].checkMouseHitbox()){
                        console.log("HIT!");
                        cancel = false;
                        if(this.drawing && this.checkValid(this.hover,connectors[key])){
                            this.hover.setEndpoint(connectors[key]);
                            wires.push(this.hover);
                            console.log(wires);
                            this.hover = null;
                            this.drawing = false;
                            break;
                        }
                    }
                }
                if(cancel){
                    console.log("MISS!");
                    this.hover = null;
                    this.drawing = false;
                }
            }

            
        }
        for(let i = 0; i < wires.length; i++){
            wires[i].draw();
        }
        if(this.hover){
            this.hover.draw();
        }
        
    }
    handleMouseUp(){

    }
    handleMouseMove(){
        for(let i = 0; i < wires.length; i++){
            wires[i].draw();
        }
        if(this.hover){
            this.hover.draw();
        }   
    }


}




class Wire{
    constructor(start, end){
        this.start = start; //Will always be of type IN
        this.end = end; //Will always be of type OUT
        this.value
        if(this.start){
            this.value = this.start.getValue();
        }
        else{
            this.value = 0;
        }
        
    }

    setEndpoint(end){
        if(this.start){
            this.end = end;
        }
        else{
            this.start = end;
        }
    }


    draw(){
        c.strokeStyle = "black";
        c.beginPath();
        if(this.start && !this.end){
            c.moveTo(this.start.getX(), this.start.getY());
            c.lineTo(currX, currY);
        }
        else if(!this.start && this.end){
            c.moveTo(this.end.getX(), this.end.getY());
            c.lineTo(currX, currY);
        }
        else{
            c.moveTo(this.start.getX(), this.start.getY());
            c.lineTo(this.end.getX(), this.end.getY());
        }
        c.stroke();
    }


}