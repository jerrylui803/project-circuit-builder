const CType = {
    IN: 0,
    OUT: 1
}

class Connector{
    constructor(x, y, type, value, gateID){
        this.x = x;
        this.y = y;
        this.d = connectorDiameter;
        this.type = type;
        this.value = value;
        this.connectorID = connectorID++;
        this.placed = false;
        //keep track of parent gate
        this.gateID = gateID;
    }

    destroyWires(){
        //Iterate through wires and find those which are connected
        for(let i = 0; i < wires.length; i++){
            if(this.connectorID == wires[i].start.connectorID || this.connectorID == wires[i].end.connectorID){
                wires.splice(i, 1);
            }
        }
    }

    updatePosition(x, y){
        this.x = x;
        this.y = y;
    }

    movePosition(x, y){
        this.x = this.x + x;
        this.y = this.y + y;
    }

    setValue(value){
        this.value = value;
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

    checkMouseHitbox(){
        let a = currX - this.x;
        let b = currY - this.y;
        return (Math.sqrt((a*a) + (b*b)) < (this.d * 2));
    }

    draw(){
        if(!this.placed){
            c.globalAlpha = 0.4;
        }
        else{
            c.globalAlpha = 1.0;
        }
        c.beginPath();
        c.lineWidth = 4;
        if(this.checkMouseHitbox()) c.strokeStyle = "red";
        else c.strokeStyle = "black";
        c.arc(this.x, this.y, this.d, 2 * Math.PI, false);
        c.closePath();
        c.stroke();
    }

}