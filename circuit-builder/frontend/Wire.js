import {Connector} from "./Connector.js";
import {fold,or,and,xor,uuidv4,pDistance} from "./Functions.js";
import {CONNECTOR,GATE,PORT,TOOL} from "./Enumeration.js";

export class WireHandler{
    constructor(components,connectors,wires){
        this.components = components;
        this.connectors = connectors;
        this.wires = wires;
        this.hover = null;
        this.drawing = false;
        this.invalid = null;
    }
    //Checks if a wire can be started from this connection
    //A wire can be started iff:
    //the connector is an output type
    //the connector is an input type and has no other wires connected
    checkConnectable(connector){
        if(connector.type == CONNECTOR.OUT){
            return true;
        }
        //Input type connector, check if it has any wires already connected
        else{
            //console.log("input type connector");
            //Loop through all wires, check if this connector already has wire
            for(let key in this.wires){
                let curr = this.wires[key];
                //If connector already has a connection
                //This only works because the current drawn wire is not in wires[]
                //If it is there is possibility of null ptr!!!!
                if(curr.getID() && curr.getID() !== this.hover && curr.getEnd().getID() == connector.getID()){
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
        let conGateID = connector.getGateID();
        let wireStart = null;
        if(wire.getStart()){
            wireStart = wire.getStart(); //start is of type connector
        }
        else{
            wireStart = wire.getEnd(); //end is of type connector
        }
        let wireGateID = wireStart.getGateID();
        //Check if wire connects to any other connections with same gateID as itself
        if(conGateID == wireGateID){
            return false;
        }
        //Check if the wire connents to its opposite type
        if(wireStart.getType() == connector.getType()){
            return false;
        }
        //Check if the connection already has a wire
        return this.checkConnectable(connector);
    }
    //Checks if a wire is being joined to its own start, if this happens it is
    //assumed that the user does not want to draw a wire
    checkCancel(wire, connector){
        let wireStart = null;
        if(wire.getStart()){
            wireStart = wire.getStart(); //start is of type connector
        }
        else{
            wireStart = wire.getEnd(); //end is of type connector
        }
        return (wireStart.getID() == connector.getID());
    }

    handleWireDown(x,y){
        if(!this.drawing){
            for(let key in this.connectors){
                if(this.connectors.hasOwnProperty(key) && 
                this.connectors[key].checkMouseHitbox(x,y) && 
                    this.checkConnectable(this.connectors[key]) &&
                    this.connectors[key] != this.connectors[this.hover]){
                    //If wire is being drawn backwards (output to input)
                    //switch the start and end connectors
                    if(this.connectors[key].getType() == CONNECTOR.IN){
                        let newWire = new Wire(uuidv4() ,null, this.connectors[key]);
                        console.log("creating new wire id",newWire.getID());
                        this.wires[newWire.getID()] = newWire;
                        this.hover = newWire.getID();
                    }
                    else{
                        let newWire = new Wire(uuidv4(), this.connectors[key], null);
                        console.log("creating new wire id",newWire.getID());
                        this.wires[newWire.getID()] = newWire;
                        this.hover = newWire.getID();
                    }
                    console.log("creating new wire at",this.connectors[key]);
                    this.drawing = true;
                    break;
                }   
            }
        }
        else{
            let cancel = true;
            for(let key in this.connectors){
                if(this.connectors.hasOwnProperty(key) && this.connectors[key].checkMouseHitbox(x,y)){
                    console.log("HIT!");
                    cancel = false;
                    if(this.checkCancel(this.wires[this.hover],this.connectors[key])){
                        this.cancelWire();
                        console.log("cancelling wire");
                        break;
                    }
                    if(this.drawing && this.checkValid(this.wires[this.hover],this.connectors[key])){
                        this.wires[this.hover].setEndpoint(this.connectors[key]);
                        this.hover = null;
                        this.drawing = false;
                        console.log("Connected endpoint");
                        break;
                    }
                }
            }

            if(cancel){
                console.log("MISS!");
                this.cancelWire();
            }
        }
    }
    cancelWire(){
        if(this.hover)
            delete this.wires[this.hover];
        this.hover = null;
        this.drawing = false;
    }

    handleDeleteDown(x,y){
        for(let key in this.wires){
            if(this.wires[key].checkMouseHitbox(x,y)){
                delete this.wires[key];
            }
        }
    }
}

export class Node{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    updatePoint(x,y){
        this.x = x;
        this.y = y;
    }
}

export class Wire{
    constructor(id,start,end){
        console.log("MAKE NEW WIRE");
        this.id = id;
        this.start = start;
        this.end = end;
        this.toDelete = false;
        this.lineWidth = 14;
        let x, y;
        if(this.start){
            x = this.start.x;
            y = this.start.y;
        }
        else{
            x = this.end.x;
            y = this.end.y;
        }
        this.nodes = [];
        this.nodes.push(new Node(x,y));
        this.nodes.push(new Node(x,y));
        
    }

    getID(){
        return this.id;
    }
    getStart(){
        return this.start;
    }

    getEnd(){
        return this.end;
    }

    updateValue(){
        if(!this.start || !this.end)
            return
        this.value = this.start.getValue();
        this.end.setValue(this.start.getValue());
    }



    queueDelete(){
        this.toDelete = true;
    }

    checkDelete(){
        return this.toDelete;
    }

    checkMouseHitbox(x,y){
        if(!this.start || !this.end){
            return false;
        }

        let startx = this.start.getX();
        let starty = this.start.getY();

        let x0 = this.nodes[0].x;
        let y0 = this.nodes[0].y;

        let endx = this.end.getX();
        let endy = this.end.getY();

        let x1 = this.nodes[1].x;
        let y1 = this.nodes[1].y;

        if(pDistance(x,y,startx,starty,x0,y0) <= this.lineWidth) return true;
        if(pDistance(x,y,x0,y0,x1,y1) <= this.lineWidth) return true;
        if(pDistance(x,y,x1,y1,endx,endy) <= this.lineWidth) return true;
        return false;
    }

    setEndpoint(end){
        if(this.start){
            this.end = end;
        }
        else{
            this.start = end;
        }
    }

    calculateNodePos(x1,y1,x2,y2){
        let meanX = (x1 + x2)/2;
        let meanY = (y1+y2)/2;

        if(x1 < x2){
            this.nodes[0].x = meanX;
            this.nodes[1].x = meanX;
            this.nodes[0].y = y1;
            this.nodes[1].y = y2;
        }
        else{
            this.nodes[0].x = x1;
            this.nodes[1].x = x2;
            this.nodes[0].y = meanY;
            this.nodes[1].y = meanY;
        }
        // if($("#wiretype").is(':checked')) { 
        //     this.nodes[0].x = x1;
        //     this.nodes[1].x = x2;
        //     this.nodes[0].y = y1;
        //     this.nodes[1].y = y2;
        // } else { 

        // } 
        // this.nodes[0].x = x1;
        // this.nodes[1].x = x2;
        // this.nodes[0].y = y1;
        // this.nodes[1].y = y2;

    }

    draw(c,x,y){
        c.strokeStyle = "black";
        c.beginPath();
        if(!this.start || !this.end){
            c.globalAlpha = 0.4;
        }
        else{
            c.globalAlpha = 1.0;
        }
        let x1, x2, y1, y2;
        if(this.start && !this.end){
            x1 = this.start.getX();
            y1 = this.start.getY();
            x2 = x;
            y2 = y;
        }
        else if(!this.start && this.end){
            x2 = this.end.getX();
            y2 = this.end.getY();
            x1 = x;
            y1 = y;
        }
        else{
            x1 = this.start.getX();
            y1 = this.start.getY();
            x2 = this.end.getX();
            y2 = this.end.getY();
        }
        this.calculateNodePos(x1,y1,x2,y2);
        c.lineJoin = "round";
        c.lineCap = "round";
        c.lineWidth = this.lineWidth;
        if(this.checkMouseHitbox(x,y)){
            c.strokeStyle = "cyan";
        }
        else{
            c.strokeStyle = "black";
        }
        c.moveTo(x1, y1);
        //c.lineTo(x2, y2);
        for(let i = 0; i < this.nodes.length; i++){
            c.lineTo(this.nodes[i].x,this.nodes[i].y);
        }
        c.lineTo(x2, y2);
        c.stroke();
        c.closePath();
        c.lineWidth = this.lineWidth/2;
        //if(this.checkMouseHitbox()) c.strokeStyle = "blue";
        if(this.value) c.strokeStyle = "yellow";
        else c.strokeStyle = "grey";
        c.beginPath();
        c.moveTo(x1, y1);
        for(let i = 0; i < this.nodes.length; i++){
            c.lineTo(this.nodes[i].x,this.nodes[i].y);
        }
        c.lineTo(x2, y2);
        //c.lineTo(x2, y2);
        c.stroke();
        c.closePath();
    }


}