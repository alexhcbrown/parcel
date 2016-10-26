(function(w){

    let stateCount = 0,
        stateList = [];

    class State {
        constructor(label, onChange, changeContext) {
            this.label = label;
            this.states = [];
            this.id = stateCount++;
            this.mergeCentre = false;
            this.onChange = onChange;
            this.changeContext = changeContext;
            this.animStep = 1000;
            stateList[this.id] = this;
        }

        copy() {
            let copy = new State(this.label,this.onChange,this.changeContext);
            copy.states = this.states;
            return copy;
        }

        deepCopy(copiedIDs,copied) {
            let copy = new State(this.label,this.onChange,this.changeContext),
                states = this.states.slice();
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

        setOnChange(callback,context) {
            this.onChange = callback;
            this.changeContext = context;
            this.subStates().forEach(state => {
                state.onChange = callback;
                state.changeContext = context;
            });
        }

        fireOnChange(ev) {
            if(this.onChange) this.onChange.call(this.changeContext,ev);
        }

        merge(states) {
            // if there is no state with the same label, add to states
            // otherwise recurse with current state of that label and
            // the sub-states from the state to merge
            //this.mergeCentre = true;
            //this.fireOnChange();
            for(let i=0, sL=states.length, s, current; i<sL; i++) {
                this.mergeOne(states[i]);
            }
            //this.mergeCentre = false;
            //this.fireOnChange();
        }

        mergeAnim(states) {
            states = states.slice();
            (function stateStep(states,current) {
                this.mergeOne(states.shift(),true);
                if(states.length>0)
                    setTimeout(
                        () => {stateStep.call(this,states)},
                        this.animStep
                    );
            }).call(this,states);
        }

        mergeOne(s,anim) {
            anim = anim || false;
            let current = this.states.find(function(checkState) {
                return checkState.label === s.label;
            });
            if(typeof current === "undefined") this.add([s.deepCopy()]);
            else {
                if(anim)
                    current.mergeAnim(s.states);
                else
                    current.merge(s.states);
            }
        }

        add(states) {
            for(let i=0,l=states.length;i<l;i++) this.addWorker(states[i]);
        }

        addAnim(states) {
            states = states.slice();
            (function addStep(states) {
                this.addWorker(states.shift());
                if(states.length > 0)
                    setTimeout(() => {addStep.call(this,states)},this.animStep);
            }).call(this,states);
        }

        addWorker(s) {
            s.changeContext = this.changeContext;
            s.onChange = this.onChange;
            this.states.push(s);
            this.fireOnChange({
                eName: "add",
                to: s,
                from: this
            });
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
