import type { Plugin } from "vite";
import { createHash } from "node:crypto";

/**
 * Generates a short, obfuscated class name from a Tailwind class
 * Uses a deterministic hash so the same class always gets the same obfuscated name
 */
function obfuscateClassName(className: string, prefix: string = "sc-"): string {
	// Create a deterministic hash
	const hash = createHash("md5").update(className).digest("hex");
	// Generate a random-looking but deterministic string
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = prefix;
	
	// Convert hex to alphanumeric (deterministic)
	// Take pairs of hex digits and map to characters
	for (let i = 0; i < 8; i += 2) {
		const hexPair = hash.substring(i, i + 2);
		const num = parseInt(hexPair, 16);
		result += chars[num % chars.length];
	}
	
	return result;
}

/**
 * Checks if a class name looks like a Tailwind utility class
 */
function isTailwindClass(className: string): boolean {
	// Skip if already obfuscated, data attributes, or custom classes
	if (
		className.startsWith("sc-") ||
		className.startsWith("data-") ||
		className.startsWith("aria-") ||
		className.includes(":") ||
		className.startsWith("dark:")
	) {
		return false;
	}
	
	// Common Tailwind patterns
	const tailwindPatterns = [
		/^(flex|grid|block|inline|hidden)/,
		/^(p|m|w|h|gap|space|text|bg|border|rounded|shadow|opacity|z-)/,
		/^(items|justify|self|place|content|align)/,
		/^(top|right|bottom|left|inset)/,
		/^(overflow|object|position|display)/,
		/^[0-9]+$/, // Numbers like "2", "4"
	];
	
	return tailwindPatterns.some((pattern) => pattern.test(className));
}

/**
 * Vite plugin to obfuscate Tailwind CSS class names in production builds
 */
export function obfuscateTailwindClasses(): Plugin {
	const classMap = new Map<string, string>();
	let isProduction = false;

	return {
		name: "obfuscate-tailwind-classes",
		enforce: "post",
		configResolved(config) {
			isProduction = config.mode === "production" || config.command === "build";
		},
		transform(code, id) {
			if (!isProduction) return null;
			if (!id.match(/\.(tsx?|jsx?)$/)) return null;

			let transformedCode = code;

			// Helper function to obfuscate a class string
			const obfuscateClassString = (classString: string): string => {
				const classList = classString.split(/\s+/).filter(Boolean);
				return classList
					.map((cls: string) => {
						// Only obfuscate Tailwind classes
						if (!isTailwindClass(cls)) {
							return cls;
						}
						
						if (!classMap.has(cls)) {
							const obfuscated = obfuscateClassName(cls);
							classMap.set(cls, obfuscated);
						}
						return classMap.get(cls)!;
					})
					.join(" ");
			};

			// Transform className attributes in JSX/TSX (string literals)
			transformedCode = transformedCode.replace(
				/className\s*=\s*{?["']([^"']+)["']}?/g,
				(match, classes) => {
					const obfuscated = obfuscateClassString(classes);
					const hasBraces = match.includes("{");
					const quote = match.includes("'") ? "'" : '"';
					return `className${hasBraces ? "={" : "="}${hasBraces ? "" : quote}${obfuscated}${hasBraces ? "" : quote}${hasBraces ? "}" : ""}`;
				}
			);

			// Transform class attributes (HTML style)
			transformedCode = transformedCode.replace(
				/\sclass\s*=\s*{?["']([^"']+)["']}?/g,
				(match, classes) => {
					const obfuscated = obfuscateClassString(classes);
					const hasBraces = match.includes("{");
					const quote = match.includes("'") ? "'" : '"';
					return ` class${hasBraces ? "={" : "="}${hasBraces ? "" : quote}${obfuscated}${hasBraces ? "" : quote}${hasBraces ? "}" : ""}`;
				}
			);

			// Transform template literals in className (e.g., className={`flex gap-2`})
			transformedCode = transformedCode.replace(
				/className\s*=\s*{`([^`]+)`}/g,
				(_match, classes) => {
					const obfuscated = obfuscateClassString(classes);
					return `className={\`${obfuscated}\`}`;
				}
			);

			if (transformedCode !== code) {
				return {
					code: transformedCode,
					map: null,
				};
			}

			return null;
		},
		generateBundle(_options, bundle) {
			if (!isProduction) return;

			// Transform CSS files - replace Tailwind class names with obfuscated ones
			for (const fileName in bundle) {
				const chunk = bundle[fileName];
				if (chunk.type === "asset" && fileName.endsWith(".css")) {
					let css = chunk.source as string;
					
					// Replace class names in CSS (in reverse order to avoid partial matches)
					const sortedEntries = Array.from(classMap.entries()).sort(
						(a, b) => b[0].length - a[0].length
					);
					
					for (const [original, obfuscated] of sortedEntries) {
						// Match CSS selectors like .flex, .gap-2, etc.
						const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
						const regex = new RegExp(`\\.${escaped}(?=[\\s{:,>+~])`, "g");
						css = css.replace(regex, `.${obfuscated}`);
					}
					
					chunk.source = css;
				}
			}
		},
	};
}

