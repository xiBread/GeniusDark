import octicons, { IconName } from "@primer/octicons";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { readFile, writeFile } from "node:fs/promises";
import postcss from "postcss";
import { renderSync } from "sass";
import tailwindcss from "tailwindcss";
import pkg from "../package.json";

const rxSVG = /<svg (.+?)>/gm;
const rxURL = /url\(([\w-]+) (fill="[\w#]+")\)/gm;

const templateKeys = ["description", "author", "version"];
const plugins = [autoprefixer, tailwindcss, cssnano];

(async () => {
	const compiled = renderSync({ file: "src/index.scss" });

	let css = compiled.css.toString();
	css = css.replace(rxURL, (_, $1, $2) => insertSVG($1, $2));
	css = (await postcss(plugins).process(css, { from: undefined })).css;

	let template = await readFile("src/template.css", "utf8");

	for (const key of templateKeys) {
		template = template.replace(`{{${key}}}`, pkg[key]);
	}

	template = template.replace("{{css}}", css);

	await writeFile("genius-dark.user.css", template);
})();

function insertSVG(name: IconName, fill: string): string {
	let svg: string = octicons[name].toSVG();
	svg = svg.replace(rxSVG, `<svg xmlns="http://www.w3.org/2000/svg" $1 ${fill}>`);

	return `url('data:image/svg+xml;charset=utf-8,${svg}')`;
}
