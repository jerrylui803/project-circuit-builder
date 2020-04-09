import {CONNECTOR,GATE,PORT,TOOL} from "./Enumeration.js";

export class Connector{

    constructor(id,gateID,type,init,size,offsetX,offsetY){
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.d = size;
        this.type = type;
        this.value = init;
        this.placed = false;
        this.connected = false;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.wires = [];
        this.toDelete = false;
        this.gateID = gateID;
    }

    getGateID(){
        return this.gateID;
    }
    
    getID(){
        return this.id;
    }

    getType(){
        return this.type;
    }

    queueDelete(){
        this.destroyWires();
        this.toDelete = true;
    }

    checkDelete(){
        return this.toDelete;
    }

    addWire(wire){
        let found = false;
        for(let i = 0; i < this.wires.length; i++){
            if(this.wires[i].getID() == wire.getID()){
                found = true;
            }
        }
        if(!found)
            this.wires.push(wire);
    }

    removeWire(id){
        for(let i = 0; i < this.wires.length; i++){
            if(this.wires.getID() == id){
                this.wires[i].queueDelete();
            }
        }
    }

    destroyWires(){
        this.wires.forEach(wire => wire.queueDelete());
    }

    updatePosition(x, y){
        this.x = x+this.offsetX;
        this.y = y+this.offsetY;
    }

    movePosition(x, y){
        this.x = this.x + x;
        this.y = this.y + y;
    }

    setPlaced(value){
        this.placed = value;
    }

    setValue(value){
        this.value = value;
    }

    setConnected(value){
        this.connected = value;
    }

    getValue(){
        return this.value;
    }

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    checkMouseHitbox(x,y){
        let a = x - this.x;
        let b = y - this.y;
        return (Math.sqrt((a*a) + (b*b)) < (this.d * 2));
    }

    // draw the connector
    draw(c,x,y){
        if(!this.placed){
            c.globalAlpha = 0.4;
        }
        else{
            c.globalAlpha = 1.0;
        }
        c.beginPath();
        c.lineWidth = 4;
        if(this.checkMouseHitbox(x,y)) c.strokeStyle = "cyan";
        else c.strokeStyle = "black";
        c.arc(this.x, this.y, this.d, 2 * Math.PI, false);
        if(this.getValue()){
            c.fillStyle = "yellow";
            c.fill();
        }
        else{
            c.fillStyle = "grey";
            c.fill();
        }
        c.closePath();
        c.stroke();
    }

}