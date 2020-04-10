import {LogicGate,GateHandler} from "./LogicGate.js";
import {Port,PortHandler} from "./IOPorts.js";
import {Wire, WireHandler} from "./Wire.js";
import {Connector, ConnectorHandler} from "./Connector.js";
import {uuidv4} from "./Functions.js";
import {CONNECTOR,GATE,PORT,TOOL} from "./Enumeration.js";

//this file operates the simulator
export class Simulator{
    constructor(canvas,images){
        this.context = canvas;
        this.selectedTool = null;
        this.selectedComponent = null;

        this.images = images;
        this.components = {};
        this.ports = {};
        this.connectors = {};
        this.wires = {};
        this.gateHandler = new GateHandler(this.images,this.components,this.connectors,this.wires);
        this.portHandler = new PortHandler(this.ports,this.connectors,this.wires);
        this.wireHandler = new WireHandler(this.components,this.connectors,this.wires);
        this.connHandler = new ConnectorHandler(this.connectors,this.wires);
    }

    updateState(state){
        // let gateHandler = state.gateHandler;
        // let portHandler = state.portHandler;
        // let wireHandler = state.wireHandler;
        // let connHandler = state.connHandler;

        this.connHandler.updateState(state.connHandler);


        this.gateHandler.updateState(state.gateHandler);

        console.log("updating sim canvas");
    }

    getJSON(){
        let output = {};
        output["gateHandler"] = this.gateHandler.getJSON();
        output["portHandler"] = this.portHandler.getJSON();
        output["wireHandler"] = this.wireHandler.getJSON();
        output["connHandler"] = this.connHandler.getJSON();

        return output;
        
        // console.log(JSON.stringify(this.gateHandler.getJSON()));
        // console.log(JSON.stringify(this.portHandler.getJSON()));
        // console.log(JSON.stringify(this.wireHandler.getJSON()));
        // console.log(JSON.stringify(this.connectorHandler.getJSON()));
    }

    setTool(tool){
        this.selectedTool = tool;
    }

    setComponent(type){
        this.selectedTool = TOOL.ADD;
        this.selectedComponent = type;
    }

    handleMouseDown(x,y,dx,dy){
        if(this.selectedTool == TOOL.ADD){
            this.gateHandler.handleAddDown(x,y);
        }
        else if(this.selectedTool == TOOL.PORT){
            this.portHandler.handleAddDown(x,y);
        }
        else if(this.selectedTool == TOOL.DELETE){
            this.gateHandler.handleDeleteDown(x,y);
            this.portHandler.handleDeleteDown(x,y);
            this.wireHandler.handleDeleteDown(x,y);
        }
        else if(this.selectedTool == TOOL.MOVE){
            this.gateHandler.handleMoveDown(x,y);
            this.portHandler.handleMoveDown(x,y);
        }
        else if(this.selectedTool == TOOL.WIRE){
            this.wireHandler.handleWireDown(x,y);
        }
        this.connHandler.updateConnectors();
        this.updateGates();
        this.updateWires();
        this.updateCanvas(x,y);
    }

    handleMouseUp(x,y,dx,dy){
        this.toString();
        if(this.selectedTool == TOOL.MOVE){
            this.gateHandler.handleMoveUp(x,y);
            this.portHandler.handleMoveUp(x,y,dx,dy);
        }
    }

    handleMouseOut(x,y,dx,dy){
        console.log(this.connectors);
        this.gateHandler.handleMouseOut(x,y);
        this.portHandler.handleMouseOut(x,y);
        this.updateCanvas(x,y);
    }

    handleMouseMove(x,y,dx,dy){
        if(this.selectedTool != TOOL.WIRE){
            this.wireHandler.cancelWire();
        }
        if(this.selectedTool == TOOL.ADD){
            this.gateHandler.handleAddMove(this.selectedComponent,x,y);
        }
        else if(this.selectedTool == TOOL.PORT){
            this.portHandler.handleAddMove(this.selectedComponent,x,y);
        }
        else if(this.selectedTool == TOOL.MOVE){
            this.gateHandler.handleMoveMove(dx,dy);
            this.portHandler.handleMoveMove(dx,dy);
        }
        this.renderCanvas(x,y);
    }

    renderCanvas(x,y){
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        for(let key in this.wires){
            this.wires[key].draw(this.context,x,y);
        }
        for(let key in this.components){
            this.components[key].draw(this.context,x,y);
        }
        for(let key in this.ports){
            this.ports[key].draw(this.context,x,y);
        }
        for(let key in this.connectors){
            this.connectors[key].draw(this.context,x,y);
        }
    }

    simulate(x,y){
        this.updateGates();
        this.updateWires();
        this.renderCanvas(x,y);
        return;
    }

    updateGates(){
        for(let key in this.components){
            this.components[key].updateValue();
        }
    }

    updateWires(){
        for(let key in this.wires){
            this.wires[key].updateValue();
        }
    }

    updateCanvas(x,y){
        for(let key in this.components){
            if(this.components[key].checkDelete()){
                delete this.components[key]
            }
        }
        for(let key in this.connectors){
            if(this.connectors[key].checkDelete()){
                delete this.connectors[key]
            }
        }
        for(let key in this.ports){
            if(this.ports[key].checkDelete()){
                delete this.ports[key]
            }
        }
        let inputs = 0;
        let outputs = 0;
        for(let key in this.ports){
            if(this.ports[key].getType() == PORT.IN){
                this.ports[key].setnum(inputs);
                inputs++;
            }
            else{
                this.ports[key].setnum(outputs);
                outputs++;
            }
        }
        for(let key in this.wires){
            if(this.wires[key].checkDelete()){
                delete this.wires[key]
            }
        }
        this.renderCanvas(x,y);
    }




}