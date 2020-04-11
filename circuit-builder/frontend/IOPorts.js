import {Connector} from "./Connector.js";
import {fold,or,and,xor,uuidv4} from "./Functions.js";
import {CONNECTOR,GATE,PORT,TOOL} from "./Enumeration.js";

export class PortHandler{
    constructor(ports,connectors,wires){
        this.ports = ports;
        this.connectors = connectors;
        this.wires = wires;
        this.hover = null;
        this.moving = null;

        this.downx = 0;
        this.downy = 0;
    }

    getJSON(){
        let output = {};
        //Hover and moving if this user
        output["hover"] = this.hover;
        output["moving"] = this.moving;
        let ports = [];
        for(let key in this.ports){
            if(this.ports.hasOwnProperty(key)){
                let curr = this.ports[key];
                let port = {};
                port["id"] = curr.getID();
                port["x"] = Math.round((curr.getX()+Number.EPSILON)*1000)/1000;
                port["y"] = Math.round((curr.getY()+Number.EPSILON)*1000)/1000;
                port["type"] = curr.getType();
                port["value"] = curr.getValue();
                port["connector"] = curr.getConnector().getID();
                ports.push(port);
            }
        }
        output["ports"] = ports;
        return output;
    }

    handleAddDown(x,y){
        if(this.hover){
            this.ports[this.hover].setPlaced(true);
            this.hover = null;
        }
    }

    handleDeleteDown(x,y){
        for(let key in this.ports){
            if(this.ports[key].checkMouseHitbox(x,y)){
                this.ports[key].queueDelete();
                break;
            }
        }
    }

    handleMoveDown(x,y){
        this.downx = x;
        this.downy = y;
        if(this.moving){
            return;
        }
        for(let key in this.ports){
            if(this.ports[key].checkMouseHitbox(x,y)){
                this.moving = this.ports[key].getID();
                break;
            }
        }
    }

    handleMoveUp(x,y,dx,dy){
        if(this.moving){
            this.moving = null;
        }
        if(x == this.downx && y == this.downy){
            for(let key in this.ports){
                if(this.ports[key].checkMouseHitbox(x,y)){
                    if(this.ports[key].getType() == PORT.IN){
                        this.ports[key].toggleValue();
                        break;
                    }
                }
            }
        }
    }

    handleMouseOut(x,y){
        if(this.hover){
            this.ports[this.hover].queueDelete();
            this.hover = null;
        }
        this.moving = null;
        
    }

    handleAddMove(type,x,y){
        if(this.hover){
            this.ports[this.hover].updatePosition(x,y);
        }
        else{
            this.createComponent(type);
            this.ports[this.hover].updatePosition(x,y);
        }
    }

    handleMoveMove(dx,dy){
        if(this.moving){
            this.ports[this.moving].movePosition(dx,dy);
        }
    }

    createComponent(type){
        let newPort = new Port(uuidv4(),type,20);
        this.ports[newPort.getID()] = newPort;

        let connector;
        if(type == PORT.IN){
            connector = (new Connector(uuidv4(),newPort.getID(),CONNECTOR.OUT,0,15,0,0))
        }
        else{ ////id,type,init,size,offsetX,offsetY
            connector = (new Connector(uuidv4(),newPort.getID(),CONNECTOR.IN,0,15,0,0))
        }
        newPort.setConnector(connector);

        this.connectors[connector.getID()] = connector;
        this.hover = newPort.getID();
    }


}

export class Port{
    constructor(id,type,d){
        this.id = id;
        this.type = type;
        this.d = d

        this.toDelete = false;
        this.value = false;
        this.placed = false;
        this.x = 0;
        this.y = 0;

        this.num = 0;

        this.connector = null;

    }
    getX(){
        return this.x;
    }
    getY(){
        return this.y;
    }
    getType(){
        return this.type;
    }
    setnum(num){
        this.num = num;
    }
    getNum(){
        return this.num;
    }
    setConnector(connector){
        this.connector = connector;
    }
    getConnector(){
        return this.connector;
    }

    getID(){
        return this.id;
    }
    getValue(){
        return this.value;
    }

    queueDelete(){
        this.toDelete = true;
        this.destroyConnectors();
    }
    checkDelete(){
        return this.toDelete;
    }

    setPlaced(val){
        this.placed = val;
        this.connector.setPlaced(val);
    }

    destroyConnectors(){
        this.connector.queueDelete();
    }

    updatePosition(x,y){
        this.x = x;
        this.y = y;
    }

    updateValue(){
        this.connector.setValue(this.value);
    }

    toggleValue(){
        this.value = !this.value;
        this.connector.setValue(this.value);
    }

    movePosition(x,y){
        this.x += x;
        this.y += y;
    }

    updatePosition(x, y){
        this.x = x;
        this.y = y;
        this.connector.updatePosition(x,y);
    }

    movePosition(x, y){
        this.x = this.x + x;
        this.y = this.y + y;
        this.connector.movePosition(x,y);
    }

    checkMouseHitbox(x,y){
        let a = x - this.x;
        let b = y - this.y;
        return (Math.sqrt((a*a) + (b*b)) < (this.d * 2));
    }

    draw(c,x,y){
        if(!this.placed){
            c.globalAlpha = 0.4;
        }
        else{
            c.globalAlpha = 1.0;
        }
        if(this.checkMouseHitbox(x,y) && this.placed){
            c.beginPath();
            c.strokeStyle = "blue"
            c.lineWidth = 8;
            c.arc(this.x, this.y, this.d, 2 * Math.PI, false);
            c.stroke();
            c.closePath();
        }
        else{
            c.beginPath();
            c.strokeStyle = "black"
            c.lineWidth = 8;
            c.arc(this.x, this.y, this.d, 2 * Math.PI, false);
            c.stroke();
            c.closePath();
        }
        if(this.type == PORT.IN){
            c.beginPath();
            c.font = "15px Arial";
            c.fillStyle = "grey";
            c.fillText("input "+this.num, this.x-this.d, this.y+this.d+15);
            c.stroke();
            c.closePath();
        }
        else{
            c.beginPath();
            c.font = "15px Arial";
            c.fillStyle = "grey";
            c.fillText("output "+this.num, this.x-this.d-5, this.y+this.d+15);
            c.stroke();
            c.closePath();
        }

    }

}