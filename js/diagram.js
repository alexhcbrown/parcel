class Diagram {
    constructor(element,states) {
        let rdata = Diagram.buildData(states),
            nodes = new vis.DataSet(rdata.nodes),
            edges = new vis.DataSet(rdata.edges),
            data = {edges:edges,nodes:nodes},
            options = {},
            network = new vis.Network(element,data,options);
    }

    static buildData(states) {
        let links = [],
            nodes = [];
        for(var i=0, l=states.length;i<l;i++) {
            let sA = states[i].states;
            for(var j=0,sL=sA.length;j<sL;j++) {
                links.push({
                    to: sA[j].id,
                    from: states[i].id,
                    arrows: "to"
                });
            }
            nodes.push({
                id: states[i].id,
                label: states[i].label
            });
        }
        return {edges:links,nodes:nodes};
    }
}
