class GateHandler {
    constructor(){
        this.gates = [];
        this.hover = null;
        this.moving = null;
        this.placed = false;
    }

    handleMouseDown(){
        if(mouseDown && tool == "ADD"){
            this.hover.placed = true;
            this.gates.push(this.hover);
            this.hover = null;
            this.placed = true;
        }
        else if(mouseDown && tool == "REMOVE"){
            //remove the newest gate
            for(let i = this.gates.length - 1; i >= 0; i--){
                if(this.gates[i].checkMouseHitbox()){
                    console.log("removing gate",i);
                    this.gates.splice(i, 1);
                    break;
                }
            }
        }
        else if(mouseDown && tool == "MOVE"){
            for(let i = this.gates.length - 1; i >= 0; i--){
                if(this.gates[i].checkMouseHitbox()){
                    console.log("moving gate",i);
                    this.moving = this.gates[i];
                    this.gates.splice(i, 1);
                    break;
                }
            }
        }

        for(let i = 0; i < this.gates.length; i++){
            this.gates[i].draw();
        }
        //draw hover after so that it stays on top
        if(this.hover){
            this.hover.draw();
            
        }
        if(this.moving){
            this.moving.draw();
        }
        
    }

    handleMouseMove(){
        for(let i = 0; i < this.gates.length; i++){
            this.gates[i].draw();
        }

        if(tool != "ADD"){
            this.hover = null;
        }
        if(tool == "ADD" && !this.placed){
            let newGate = new LogicGate("NOT");
            this.hover = newGate;
        }
        if(this.hover){
            this.hover.updatePosition(currX, currY);
            this.hover.draw();
        }
        if(this.moving){
            this.moving.movePosition(mouseDx, mouseDy);
            this.moving.draw();
        }

    }

    handleMouseUp(){
        this.placed = false;
        if(tool == "MOVE"){
            this.gates.push(this.moving);
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

        //To help with hitbox detection
        this.x;
        this.y;
        this.dx;
        this.dy;

        //this.input.push(new Connector(this.valX - 10, this.valY, CType.IN, 0));
        //this.output = (new Connector(this.valX + 10, this.valY, CType.OUT, 1));
    }

    updatePosition(x, y){
        this.valX = x;
        this.valY = y;
        this.x = x - (this.width/2);
        this.y = y - (this.height/2);
        this.dx = x + (this.width/2);
        this.dy = y + (this.height/2);

        //console.log(this.valX, this.valY, this.x, this.y, this.dx, this.dy);

        for(let i = 0; i < this.input.length; i++){
            this.input[i].updatePosition(x, y);
        }
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
            this.input[i].movePosition(x, y);
        }
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

    destroy(){
        
    }
    //Global vars required: mouseDx, mouseDy, currX, currY, gateSVG
    //mouseDown, mouseOut, c (canvas context)

    draw(){
        for(let i = 0; i < this.input.length; i++){
            this.input[i].draw();
        }
        if(!this.placed){
            c.globalAlpha = 0.4;
        }
        else{
            c.globalAlpha = 1.0;
        }
        if(this.checkMouseHitbox() && this.placed){
            c.rect(this.x, this.y, this.width, this.height);
            c.strokeStyle = "blue"
            c.lineWidth = 4;
            c.stroke();
        }
        c.beginPath();
        c.drawImage(image, this.x, this.y);
        c.stroke();
        c.closePath();
    }


}