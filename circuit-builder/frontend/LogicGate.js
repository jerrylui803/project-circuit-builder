class GateHandler {
    constructor(){
        gates = [];
        this.hover = null;
        this.moving = null;
        this.placed = false;
    }

    handleMouseDown(){
        if(mouseDown && tool == "ADD"){
            this.hover.setPlaced(true);
            // let xpos = this.hover.valX;
            // let ypos = this.hover.valY;
            // this.hover.addInput(new Connector(xpos - 100, ypos, CType.IN, 0));
            // this.hover.addOutput(new Connector(xpos + 50, ypos, CType.OUT, 1));
            gates.push(this.hover);
            this.hover = null;
            this.placed = true;
        }
        else if(mouseDown && tool == "REMOVE"){
            //remove the newest gate
            for(let i = gates.length - 1; i >= 0; i--){
                if(gates[i].checkMouseHitbox()){
                    console.log("removing gate",i);//------------------------------------------------
                    gates[i].destroyConnectors();
                    gates.splice(i, 1);
                    break;
                }
            }
        }
        else if(mouseDown && tool == "MOVE"){
            for(let i = gates.length - 1; i >= 0; i--){
                if(gates[i].checkMouseHitbox()){
                    console.log("moving gate",i);
                    this.moving = gates[i];//------------------------------------------------
                    gates.splice(i, 1);
                    break;
                }
            }
        }

        for(let i = 0; i < gates.length; i++){
            gates[i].draw();
        }
        //draw hover after so that it stays on top
        if(this.hover){
            this.hover.draw();
            
        }
        if(this.moving){
            this.moving.draw();
        }
        mouseDown = false;
        //draw the connectors
        for(var key in connectors){
            if (connectors.hasOwnProperty(key)) {           
                connectors[key].draw();
            }
        }
    }

    handleMouseMove(){
        for(let i = 0; i < gates.length; i++){
            gates[i].draw();
        }

        if(tool != "ADD"){
            if(this.hover){
                this.hover.destroyConnectors();   //------------------------------------------------
            }
            this.hover = null;
        }
        if(tool == "ADD" && !this.placed){
            //If hover doesnt exist yet, make a new hover
            if(this.hover == null){
                let newGate = new LogicGate("NOT");
                this.hover = newGate;
            }
        }
        if(this.hover){
            this.hover.updatePosition(currX, currY);
            this.hover.draw();
        }
        if(this.moving){
            this.moving.movePosition(mouseDx, mouseDy);
            this.moving.draw();
        }
       //draw the connectors
       for(var key in connectors){
            if (connectors.hasOwnProperty(key)) {           
                connectors[key].draw();
            }
        }
    }

    handleMouseUp(){
        this.placed = false;
        if(tool == "MOVE" && this.moving){
            gates.push(this.moving);//------------------------------------------------
            this.moving = null;
        }
    }

    handleMouseOut(){

    }



}



class LogicGate {
    constructor(type){
        this.type = type;
        this.width = image.width;
        this.height = image.height;
        this.valX = currX;
        this.valY = currY;
        this.input = [];
        this.output = null;
        this.placed = false;
        this.gateID = gateID++;
        //To help with hitbox detection
        this.x;
        this.y;
        this.dx;
        this.dy;

        //this.valX+(connectorDiameter/2)+(this.width/2)
        // this.input.push(new Connector(this.valX-((connectorDiameter/2)+(this.width/2)), this.valY, CType.IN, 0, this.gateID));
        // this.output = new Connector(this.valX+((connectorDiameter/2)+(this.width/2)), this.valY, CType.OUT, 1, this.gateID);
        let input1 = new Connector(this.valX-((connectorDiameter/2)+(this.width/2)), this.valY, CType.IN, 0, this.gateID);
        let output = new Connector(this.valX+((connectorDiameter/2)+(this.width/2)), this.valY, CType.OUT, 1, this.gateID);

        connectors[input1.connectorID] = input1;
        connectors[output.connectorID] = output;

        this.input.push(input1.connectorID);
        this.output = output.connectorID;

    }

    addInput(input){
        this.input.push(input);
    }
    
    addOutput(output){
        this.output = output;
    }
    setPlaced(val){
        this.placed = val;
        for(let i = 0; i < this.input.length; i++){
            connectors[this.input[i]].placed = val;
        }
        connectors[this.output].placed = val;
    }

    destroyConnectors(){
        for(let i = 0; i < this.input.length; i++){
            connectors[this.input[i]].destroyWires();
            delete connectors[this.input[i]];
        }
        connectors[this.output].destroyWires();
        delete connectors[this.output];
    }

    updatePosition(x, y){
        this.valX = x;
        this.valY = y;
        this.x = x - (this.width/2);
        this.y = y - (this.height/2);
        this.dx = x + (this.width/2);
        this.dy = y + (this.height/2);

        //console.log(this.valX, this.valY, this.x, this.y, this.dx, this.dy);
        //TODO: evenly distribute inputs along gate input side
        for(let i = 0; i < this.input.length; i++){
            connectors[this.input[i]].updatePosition(x-((connectorDiameter/2)+(this.width/2)), y);
        }
        connectors[this.output].updatePosition(x+((connectorDiameter/2)+(this.width/2)), y);
        
        return;
    }

    movePosition(x, y){
        this.valX = this.valX + x;
        this.valY = this.valY + y;
        this.x = this.x + x;
        this.y = this.y + y;
        this.dx = this.dx + x;
        this.dy = this.dy + y;

        for(let i = 0; i < this.input.length; i++){
            connectors[this.input[i]].movePosition(x, y);
        }
        connectors[this.output].movePosition(x,y);
        return;
    }

    //return true if mouse is inside hitbox
    checkMouseHitbox(){
        return (currX >= this.x && currX <= this.dx && currY >= this.y && currY <= this.dy);
    }

    //return true if hit box intersects this gate
    checkIntersect(x1, y1, x2, y2){
        if(this.x >= x2 || x1 >= this.dx) return false;
        if(this.y >= y2 || y1 >= this.dy) return false;
        return true;
    }

    removeInput(){

    }
    //Global vars required: mouseDx, mouseDy, currX, currY, gateSVG
    //mouseDown, mouseOut, c (canvas context)

    draw(){
        if(!this.placed){
            c.globalAlpha = 0.4;
        }
        else{
            c.globalAlpha = 1.0;
        }
        if(this.checkMouseHitbox() && this.placed){
            c.beginPath();
            c.rect(this.x, this.y, this.width, this.height);
            c.strokeStyle = "blue"
            c.lineWidth = 4;
            c.closePath();
            c.stroke();
        }
        c.beginPath();
        c.drawImage(image, this.x, this.y);
        c.stroke();
        c.closePath();
        // for(let i = 0; i < this.input.length; i++){
        //     this.input[i].draw();
        // }
        // if(this.output){
        //     this.output.draw();
        // }
    }


}