class Diagram {
    constructor(element,states) {
        this.stateHolder = new AnimState("DiagramParent");
        this.stateHolder.add(states);
        this.stateIDs = this.stateHolder.subStateIDs();
        this.states = this.stateHolder.subStates();
        this.buildData(this.states);
        this.options = {autoResize: true};
        this.network = new vis.Network(element,this.data,this.options);
    }

    makeLive() {
        this.stateHolder.setOnChange(this.refresh,this);
    }

    refresh(ev) {
        //console.log(ev);
        if(ev.eName === "add") {
            this.addGroup(ev.from,ev.to);
        }
        if(ev.eName === "update") {
            this.updateNode(ev.node);
        }
    }

    onResize(resizeFunc) {
        this.resizeFunc = resizeFunc;
        if(this.options.autoResize) {
            this.options.autoResize = false;
            this.updateOptions();
            window.addEventListener("resize",()=>{
                let s = this.resizeFunc();
                this.network.setSize(s[0],s[1]);
                this.network.redraw();
                this.network.fit();
            });
        }
    }

    addGroup(fro,to) {
        if(this.stateIDs.indexOf(to.id) === -1) {
            this.addNode(to);
            this.stateIDs.push(to.id);
            to.states.forEach((state) => {
                this.addGroup(to,state);
            });
        }
        this.addEdge(to,fro);
    }

    buildData(states) {
        this.nodes = new vis.DataSet({});
        this.edges = new vis.DataSet({});
        for(var i=0, l=states.length;i<l;i++) {
            let sA = states[i].states;
            for(var j=0,sL=sA.length;j<sL;j++) {
                this.addEdge(sA[j],states[i]);
            }
            this.addNode(states[i]);
        }
        this.data = {edges:this.edges,nodes:this.nodes};
        return this.data;
    }

    addNode(node) {
        this.nodes.add(this.nodeObject(node));
    }

    updateNode(node) {
        console.log(this.nodeObject(node));
        this.nodes.update([this.nodeObject(node)]);
    }

    nodeObject(node) {
        return {
            id: node.id,
            label: node.label,
            color: node.mergeCentre ? "lightGreen" : "lightBlue"
        }
    }

    addEdge(to,from) {
        this.edges.add({
            to: to.id,
            from: from.id,
            arrows: "to"
        });
    }

    updateOptions() {
        this.network.setOptions(this.options);
    }

    diffStates(states) {
        // have a parent state - starts as this.stateHolder
        // have the current states - starts as parent.states
        // have the new states - starts as states
        // at each level add or remove unshared states and
        // iterate on shared states that have not yet been a parent
        (function diffWorker(parent,oldParents,states) {
            let news = states.slice(),nss;
            parent.states.forEach((oldState) => {
                if(nss = states.find((ns) => ns.label === oldState.label)) {
                    news = news.filter((ns) => ns.label !== oldState.label);
                    if(!oldParents.find((oid) => oid === oldState.id)) {
                        oldParents.push(oldState);
                        diffWorker.call(this,oldState,oldParents,nss.states);
                    }
                }
                else {
                    this.nodes.remove({id:oldState.id});
                }
            });
            news.forEach((ns) => {
                parent.add([ns]);
            });
        }).call(this,this.stateHolder,[this.stateHolder.id],states);
        //this.stateHolder.states = states;
    }
}
