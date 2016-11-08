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
        copy.setLabelsFromNode(this,true);
        return copy;
    }

    setLabelsFromNode(node,supress) {
        super.setLabelsFromNode(node);
        if(!supress) {
            this.fireOnChange({
                eName: "update",
                node: this
            });
        }
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

    addOne(s) {
        if(s instanceof AnimState) {
            s.changeContext = this.changeContext;
            s.onChange = this.onChange;
            s.subStates().forEach(state => {
                state.onChange = this.onChange;
                state.changeContext = this.changeContext;
            });
        }
        super.addOne(s);
        this.fireOnChange({
            eName: "add",
            to: s,
            from: this
        });
    }

}
