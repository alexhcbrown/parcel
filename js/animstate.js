class AnimState extends State {

    constructor(label, onChange, changeContext) {
        super(label);
        this.animStep = 1000;
        this.onChange = onChange;
        this.changeContext = changeContext;
        this.mergeCentre = false;
    }

    copy() {
        let copy = new AnimState(this.label,this.onChange,this.changeContext);
        copy.states = this.states;
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

    mergeAnim(states) {
        console.log(this.label);
        this.updateRender({mergeCentre:true});
        states = states.slice();
        function stateStep(states,current) {
            this.mergeOne(states.shift(),true);
            //this.updateRender({mergeCentre:true});
            if(states.length>0)
                setTimeout(
                    () => {stateStep.call(this,states)},
                    this.animStep
                );
            else setTimeout(
                ()=>{this.updateRender({mergeCentre:false});},
                this.animStep
            );
        }
        setTimeout(
            () => {stateStep.call(this,states)},
            this.animStep
        );
    }

    mergeOne(s,anim) {
        anim = anim || false;
        let current = this.select(s.label);
        if(typeof current === "undefined") this.add([s.deepCopy()]);
        else {
            if(anim) {
                setTimeout(()=>{
                    this.updateRender({mergeCentre:false});
                    current.mergeAnim(s.states)
                },this.animStep);
            }
            else
                current.merge(s.states);
        }
    }

    updateRender(mObj) {
        Object.keys(mObj).forEach((name) => {
            this[name] = mObj[name];
        });
        this.fireOnChange({
            eName: "update",
            node: this
        })}

    addAnim(states) {
        states = states.slice();
        (function addStep(states) {
            this.addOne(states.shift());
            if(states.length > 0)
                setTimeout(() => {addStep.call(this,states)},this.animStep);
        }).call(this,states);
    }

    addOne(s) {
        if(s instanceof AnimState) {
            s.changeContext = this.changeContext;
            s.onChange = this.onChange;
        }
        super.addOne(s);
        this.fireOnChange({
            eName: "add",
            to: s,
            from: this
        });
    }

}
