const CType = {
    IN: 0,
    OUT: 1
}

class Connector{
    constructor(x, y, type, value){
        this.x = x;
        this.y = y;
        this.d = connectorDiameter;
        this.type = type;
        this.value = value;
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
        return (dist(currX, currY, this.x, this.y) < (this.d) / 2);
    }

    draw(){
        c.beginPath();
        c.lineWidth = 4;
        c.strokeStyle = "black";
        c.arc(this.x, this.y, this.d, 2 * Math.PI, false);
        c.closePath();
        c.stroke();
    }

}