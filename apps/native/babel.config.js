module.exports = (api) => {
	api.cache(true);
	
	return {
		presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
		plugins: [
			// Keep the reanimated plugin last
			"react-native-reanimated/plugin",
		],
	};
};
