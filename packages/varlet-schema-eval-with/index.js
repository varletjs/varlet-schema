function evalWith(expression, ctx = window) {
	// @ts-ignore
	with (ctx) {
		return eval(`(${expression})`)
	}
}