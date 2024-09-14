/// <reference path="./References.d.ts"/>
import Config from "./Config"
import * as Constants from "./Constants"
import * as GlobalTypes from "./types/GlobalTypes"
import * as MiscUtils from './utils/MiscUtils';
import * as Monaco from "monaco-editor"
import loader from "@monaco-editor/loader"
import path from "path"

export interface Callback {
	(): void
}

let callbacks: Set<Callback> = new Set<Callback>()

export function save(): Promise<void> {
	return Config.save({
		theme: Config.theme,
	})
}

export function light(): void {
	Config.theme = "light"
	document.body.className = ""
	Constants.triggerChange()
	callbacks.forEach((callback: Callback): void => {
		callback()
	})
}

export function dark(): void {
	Config.theme = "dark"
	document.body.className = "bp5-dark"
	Constants.triggerChange()
	callbacks.forEach((callback: Callback): void => {
		callback()
	})
}

export function toggle(): void {
	if (Config.theme === "light") {
		dark()
	} else {
		light()
	}
}

export function theme(): string {
	return Config.theme
}

export function editorTheme(): string {
	if (Config.theme === "light") {
		return "tomorrow"
	} else {
		return "tomorrow-night"
	}
}

export function chartColor1(): string {
	if (Config.theme === "light") {
		return "rgba(0, 0, 0, 0.9)"
	} else {
		return "rgba(255, 255, 255, 1)"
	}
}

export function chartColor2(): string {
	if (Config.theme === "light") {
		return "rgba(0, 0, 0, 0.2)"
	} else {
		return "rgba(255, 255, 255, 0.2)"
	}
}

export function chartColor3(): string {
	if (Config.theme === "light") {
		return "#6f6f6f"
	} else {
		return "#e5e5e5"
	}
}

export function addChangeListener(callback: Callback): void {
	callbacks.add(callback)
}

export function removeChangeListener(callback: () => void): void {
	callbacks.delete(callback)
}

let tomorrowNight = {
	"base": "vs-dark",
	"inherit": true,
	"rules": [
		{"background": "1D1F21","token": ""},
		{"foreground": "969896","token": "comment"},
		{"foreground": "ced1cf","token": "keyword.operator.class"},
		{"foreground": "ced1cf","token": "constant.other"},
		{"foreground": "ced1cf","token": "source.php.embedded.line"},
		{"foreground": "cc6666","token": "variable"},
		{"foreground": "cc6666","token": "support.other.variable"},
		{"foreground": "cc6666","token": "string.other.link"},
		{"foreground": "cc6666","token": "string.regexp"},
		{"foreground": "cc6666","token": "entity.name.tag"},
		{"foreground": "cc6666","token": "entity.other.attribute-name"},
		{"foreground": "cc6666","token": "meta.tag"},
		{"foreground": "cc6666","token": "declaration.tag"},
		{"foreground": "cc6666","token": "markup.deleted.git_gutter"},
		{"foreground": "de935f","token": "constant.numeric"},
		{"foreground": "de935f","token": "constant.language"},
		{"foreground": "de935f","token": "support.constant"},
		{"foreground": "de935f","token": "constant.character"},
		{"foreground": "de935f","token": "variable.parameter"},
		{"foreground": "de935f","token": "punctuation.section.embedded"},
		{"foreground": "de935f","token": "keyword.other.unit"},
		{"foreground": "f0c674","token": "entity.name.class"},
		{"foreground": "f0c674","token": "entity.name.type.class"},
		{"foreground": "f0c674","token": "support.type"},
		{"foreground": "f0c674","token": "support.class"},
		{"foreground": "b5bd68","token": "string"},
		{"foreground": "b5bd68","token": "constant.other.symbol"},
		{"foreground": "b5bd68","token": "entity.other.inherited-class"},
		{"foreground": "b5bd68","token": "markup.heading"},
		{"foreground": "b5bd68","token": "markup.inserted.git_gutter"},
		{"foreground": "8abeb7","token": "keyword.operator"},
		{"foreground": "8abeb7","token": "constant.other.color"},
		{"foreground": "81a2be","token": "entity.name.function"},
		{"foreground": "81a2be","token": "meta.function-call"},
		{"foreground": "81a2be","token": "support.function"},
		{"foreground": "81a2be","token": "keyword.other.special-method"},
		{"foreground": "81a2be","token": "meta.block-level"},
		{"foreground": "81a2be","token": "markup.changed.git_gutter"},
		{"foreground": "b294bb","token": "keyword"},
		{"foreground": "b294bb","token": "storage"},
		{"foreground": "b294bb","token": "storage.type"},
		{"foreground": "b294bb","token": "entity.name.tag.css"},
		{"foreground": "ced2cf","background": "df5f5f","token": "invalid"},
		{"foreground": "ced2cf","background": "82a3bf","token": "meta.separator"},
		{"foreground": "ced2cf","background": "b798bf","token": "invalid.deprecated"},
		{"foreground": "ffffff","token": "markup.inserted.diff"},
		{"foreground": "ffffff","token": "markup.deleted.diff"},
		{"foreground": "ffffff","token": "meta.diff.header.to-file"},
		{"foreground": "ffffff","token": "meta.diff.header.from-file"},
		{"foreground": "718c00","token": "markup.inserted.diff"},
		{"foreground": "718c00","token": "meta.diff.header.to-file"},
		{"foreground": "c82829","token": "markup.deleted.diff"},
		{"foreground": "c82829","token": "meta.diff.header.from-file"},
		{"foreground": "ffffff","background": "4271ae","token": "meta.diff.header.from-file"},
		{"foreground": "ffffff","background": "4271ae","token": "meta.diff.header.to-file"},
		{"foreground": "3e999f","fontStyle": "italic","token": "meta.diff.range"}
	],
	"colors": {
		"editor.foreground": "#C5C8C6",
		"editor.background": "#1D1F21",
		"editor.selectionBackground": "#373B41",
		"editor.lineHighlightBackground": "#282A2E",
		"editorCursor.foreground": "#AEAFAD",
		"editorWhitespace.foreground": "#4B4E55"
	}
} as Monaco.editor.IStandaloneThemeData

let tomorrow = {
	"base": "vs",
	"inherit": true,
	"rules": [
		{"background": "FFFFFF","token": ""},
		{"foreground": "8e908c","token": "comment"},
		{"foreground": "666969","token": "keyword.operator.class"},
		{"foreground": "666969","token": "constant.other"},
		{"foreground": "666969","token": "source.php.embedded.line"},
		{"foreground": "c82829","token": "variable"},
		{"foreground": "c82829","token": "support.other.variable"},
		{"foreground": "c82829","token": "string.other.link"},
		{"foreground": "c82829","token": "string.regexp"},
		{"foreground": "c82829","token": "entity.name.tag"},
		{"foreground": "c82829","token": "entity.other.attribute-name"},
		{"foreground": "c82829","token": "meta.tag"},
		{"foreground": "c82829","token": "declaration.tag"},
		{"foreground": "c82829","token": "markup.deleted.git_gutter"},
		{"foreground": "f5871f","token": "constant.numeric"},
		{"foreground": "f5871f","token": "constant.language"},
		{"foreground": "f5871f","token": "support.constant"},
		{"foreground": "f5871f","token": "constant.character"},
		{"foreground": "f5871f","token": "variable.parameter"},
		{"foreground": "f5871f","token": "punctuation.section.embedded"},
		{"foreground": "f5871f","token": "keyword.other.unit"},
		{"foreground": "c99e00","token": "entity.name.class"},
		{"foreground": "c99e00","token": "entity.name.type.class"},
		{"foreground": "c99e00","token": "support.type"},
		{"foreground": "c99e00","token": "support.class"},
		{"foreground": "718c00","token": "string"},
		{"foreground": "718c00","token": "constant.other.symbol"},
		{"foreground": "718c00","token": "entity.other.inherited-class"},
		{"foreground": "718c00","token": "markup.heading"},
		{"foreground": "718c00","token": "markup.inserted.git_gutter"},
		{"foreground": "3e999f","token": "keyword.operator"},
		{"foreground": "3e999f","token": "constant.other.color"},
		{"foreground": "4271ae","token": "entity.name.function"},
		{"foreground": "4271ae","token": "meta.function-call"},
		{"foreground": "4271ae","token": "support.function"},
		{"foreground": "4271ae","token": "keyword.other.special-method"},
		{"foreground": "4271ae","token": "meta.block-level"},
		{"foreground": "4271ae","token": "markup.changed.git_gutter"},
		{"foreground": "8959a8","token": "keyword"},
		{"foreground": "8959a8","token": "storage"},
		{"foreground": "8959a8","token": "storage.type"},
		{"foreground": "ffffff","background": "c82829","token": "invalid"},
		{"foreground": "ffffff","background": "4271ae","token": "meta.separator"},
		{"foreground": "ffffff","background": "8959a8","token": "invalid.deprecated"},
		{"foreground": "ffffff","token": "markup.inserted.diff"},
		{"foreground": "ffffff","token": "markup.deleted.diff"},
		{"foreground": "ffffff","token": "meta.diff.header.to-file"},
		{"foreground": "ffffff","token": "meta.diff.header.from-file"},
		{"background": "718c00","token": "markup.inserted.diff"},
		{"background": "718c00","token": "meta.diff.header.to-file"},
		{"background": "c82829","token": "markup.deleted.diff"},
		{"background": "c82829","token": "meta.diff.header.from-file"},
		{"foreground": "ffffff","background": "4271ae","token": "meta.diff.header.from-file"},
		{"foreground": "ffffff","background": "4271ae","token": "meta.diff.header.to-file"},
		{"foreground": "3e999f","fontStyle": "italic","token": "meta.diff.range"}
	],
	"colors": {
		"editor.foreground": "#4D4D4C",
		"editor.background": "#FFFFFF",
		"editor.selectionBackground": "#D6D6D6",
		"editor.lineHighlightBackground": "#EFEFEF",
		"editorCursor.foreground": "#AEAFAD",
		"editorWhitespace.foreground": "#D1D1D1"
	}
} as Monaco.editor.IStandaloneThemeData

loader.config({
	paths: {
		vs: MiscUtils.uriFromPath(path.join(__dirname, "static", "vs")),
	},
})

loader.init().then((monaco: any) => {
	monaco.editor.defineTheme("tomorrow-night", tomorrowNight)
	monaco.editor.defineTheme("tomorrow", tomorrow)
})
