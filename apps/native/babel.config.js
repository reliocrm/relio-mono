module.exports = (api) => {
	api.cache(true);
	const plugins = [
		"nativewind/babel",
		// Keep the reanimated plugin last
		"react-native-reanimated/plugin",
	];

	return {
		presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
		plugins,
	};
};
