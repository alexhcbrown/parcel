class AnimGrammar extends Grammar {
    makeState(label) {
        return new AnimState(label);
    }
}
