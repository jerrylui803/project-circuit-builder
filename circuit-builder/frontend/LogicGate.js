import {Connector} from "./Connector.js";
import {fold,or,and,xor,uuidv4} from "./Functions.js";
import {CONNECTOR,GATE,PORT,TOOL} from "./Enumeration.js";

export class GateHandler{
    constructor(images,components,connectors,wires){
        this.images = images;
        this.components = components;
        this.connectors = connectors;
        this.wires = wires;
        this.hover = null;
        this.moving = null;
    }

    handleAddDown(x,y){
        if(this.hover){
            this.components[this.hover].setPlaced(true);
            this.hover = null;
        }
    }

    handleDeleteDown(x,y){
        for(let key in this.components){
            if(this.components[key].checkMouseHitbox(x,y)){
                this.components[key].queueDelete();
                break;
            }
        }
    }

    handleMoveDown(x,y){
        if(this.moving){
            return;
        }
        for(let key in this.components){
            if(this.components[key].checkMouseHitbox(x,y)){
                this.moving = this.components[key].getID();
                break;
            }
        }
    }

    handleMoveUp(x,y){
        if(this.moving){
            this.moving = null;
        }
    }

    handleMouseOut(x,y){
        if(this.hover){
            this.components[this.hover].queueDelete();
            this.hover = null;
        }
        this.moving = null;
        
    }

    handleAddMove(type,x,y){
        if(this.hover){
            this.components[this.hover].updatePosition(x,y);
        }
        else{
            this.createComponent(type);
            this.components[this.hover].updatePosition(x,y);
        }
    }

    handleMoveMove(dx,dy){
        if(this.moving){
            this.components[this.moving].movePosition(dx,dy);
        }
    }

    createComponent(type){
        let newGate = new LogicGate(uuidv4(),type,this.images[type]);
        this.components[newGate.getID()] = newGate;

        let inputs = [];
        let output = null;
        //id,type,init,size,offsetX,offsetY
        if(type == GATE.NOT){
            inputs.push(new Connector(uuidv4(),newGate.getID(),CONNECTOR.IN,0,8,-((8/2)+(newGate.width/2)),0));
        }
        else{
            inputs.push(new Connector(uuidv4(),newGate.getID(),CONNECTOR.IN,0,8,-((8/2)+(newGate.width/2)),11));
            inputs.push(new Connector(uuidv4(),newGate.getID(),CONNECTOR.IN,0,8,-((8/2)+(newGate.width/2)),-10));
        }
        if(type == GATE.NOT || type == GATE.NOR || type == GATE.NAND || type == GATE.XNOR){
            output = (new Connector(uuidv4(),newGate.getID(),CONNECTOR.OUT,0,8,((8/2)+(newGate.width/2)),0))
        }
        else{
            output= (new Connector(uuidv4(),newGate.getID(),CONNECTOR.OUT,1,8,((8/2)+(newGate.width/2)),0))

        }
       
        newGate.setInputs(inputs);
        newGate.setOutput(output);

        inputs.forEach(input => this.connectors[input.getID()] = input);
        this.connectors[output.getID()] = output;

        this.hover = newGate.getID();
    }
}


export class LogicGate {

    constructor(id,type,image){
        this.id = id;
        this.type = type;
        this.image = image;

        this.width = this.image.width;
        this.height = this.image.height;

        this.placed = false;
        this.toDelete = false;
        this.cx = 0;
        this.cy = 0;
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;

        this.inputs = [];
        this.output = null;
    }

    queueDelete(){
        this.toDelete = true;
        this.destroyConnectors();
    }
    checkDelete(){
        return this.toDelete;
    }

    updateValue(){
        let inputs = [];
        this.inputs.forEach(input => inputs.push(input.getValue()));
        switch(this.type){
            case GATE.NOT:
                this.output.setValue(!or(inputs));
                break;
            case GATE.AND:
                this.output.setValue(and(inputs));
                break;
            case GATE.OR:
                this.output.setValue(or(inputs));
                break;
            case GATE.NOR:
                this.output.setValue(!or(inputs));
                break;
            case GATE.NAND:
                this.output.setValue(!and(inputs));
                break;
            case GATE.XOR:
                this.output.setValue(xor(inputs));
                break;
            case GATE.XNOR:
                this.output.setValue(!xor(inputs));
                break;
            }
    }


    getID(){
        return this.id;
    }

    setInputs(inputs){
        this.inputs = inputs;
    }

    setOutput(output){
        this.output = output;
    }

    setPlaced(val){
        this.placed = val;
        this.inputs.forEach(input => input.setPlaced(val));
        this.output.setPlaced(val);
    }

    destroyConnectors(){
        this.inputs.forEach(input => input.queueDelete());
        this.output.queueDelete();
    }

    updateCorners(){
        this.x = this.cx - (this.width/2);
        this.y = this.cy - (this.height/2);
        this.dx = this.cx + (this.width/2);
        this.dy = this.cy + (this.height/2);
    }

    updatePosition(x, y){
        this.cx = x;
        this.cy = y;
        this.updateCorners();
        this.inputs.forEach(input => input.updatePosition(x,y));
        this.output.updatePosition(x,y);
    }

    movePosition(x, y){
        this.cx = this.cx + x;
        this.cy = this.cy + y;
        this.updateCorners();
        this.inputs.forEach(input => input.movePosition(x,y));
        this.output.movePosition(x,y);
    }

    //return true if mouse is inside hitbox
    checkMouseHitbox(x,y){
        return (x >= this.x && x <= this.dx && y >= this.y && y <= this.dy);
    }

    // draw logic gate on canvas
    draw(c,x,y){
        if(!this.placed){
            c.globalAlpha = 0.4;
        }
        else{
            c.globalAlpha = 1.0;
        }
        if(this.checkMouseHitbox(x,y) && this.placed){
            c.beginPath();
            c.rect(this.x, this.y, this.width, this.height);
            c.strokeStyle = "blue"
            c.lineWidth = 4;
            c.closePath();
            c.stroke();
        }
        c.beginPath();
        c.drawImage(this.image, this.x, this.y);
        c.stroke();
        c.closePath();
    }


}