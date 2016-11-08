(function(w){

    let stateCount = 0,
        stateList = [],
        labelNames = ["endable","ruleState","terminal"];

    class State {
        constructor(label) {
            this.label = label;
            this.states = [];
            this.id = stateCount++;
            stateList[this.id] = this;
        }

        copy() {
            let copy = new State(this.label);
            copy.states = this.states;
            copy.setLabelsFromNode(this);
            return copy;
        }

        setLabelsFromNode(node) {
            labelNames.forEach((n)=>{
                this[n] = node[n]
            });
        }

        deepCopy(copiedIDs,copied) {
            let copy = this.copy(),
                states = this.states.slice();
            copy.states = [];
            copiedIDs = copiedIDs || []; copied = copied || {};
            copiedIDs.push(this.id);
            copied[this.id] = copy;
            (function depthWorker(states) {
                if(states.length > 0) {
                    let s = states.shift();
                    if(copiedIDs.indexOf(s.id) !== -1)
                        copy.states.push(copied[s.id]);
                    else copy.states.push(s.deepCopy(copiedIDs,copied));
                    depthWorker.call(this,states);
                }
            }).call(this,states);
            return copy;
        }

        merge(states) {
            // if there is no state with the same label, add to states
            // otherwise recurse with current state of that label and
            // the sub-states from the state to merge
            for(let i=0, sL=states.length, s, current; i<sL; i++) {
                this.mergeOne(states[i]);
            }
        }

        mergeOne(s) {
            let current = this.select(s.label);
            if(typeof current === "undefined") this.add([s.deepCopy()]);
            else {
                current.endable = current.endable || s.endable;
                current.merge(s.states)
            };
        }

        select(label) {
            return this.states.find(function(checkState) {
                return checkState.label === label;
            });
        }

        add(states) {
            for(let i=0,l=states.length;i<l;i++) this.addOne(states[i]);
        }

        addOne(s) {
            this.states.push(s);
        }

        subStates() {
            let retStates = [],
                r = this.subStateIDs();
            r.forEach(id => retStates.push(stateList[id]));
            return retStates;
        }

        subStateIDs(inc) {
            function getIds(state,read,go) {
                if(read.indexOf(state.id) === -1) {
                    if(go) read.push(state.id);
                    for(let i=0,l=state.states.length;i<l;i++) {
                        getIds(state.states[i],read,true);
                    }
                }
            }
            let r = [];
            getIds(this,r,inc);
            return r;
        }
    }

    w.State = State;

})(window);
