
class Wire{
    constructor(start){
        this.start = start;
        this.end = null;
        this.value = start.getValue();
    }

    setEnd(end){
        this.end = end;
    }

    draw(){
        c.strokeStyle = "black";
        c.beginPath();
        c.moveTo(start.getX(), start.getY());
        if(this.end) c.lineTo(end.getX(), end.getY()); 
        else c.lineTo(currX, currY);
        c.stroke();
    }

    setEnd(end){
        //Cannot connect to itself
        if(end == this.start){
            return false;
        }
        else{
            this.end = end;
        }
        return true;
    }




}