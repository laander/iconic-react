const fs = require("fs");
const path = require("path");
const { titleCase } = require("title-case");
const svgr = require("@svgr/core").default;

const iconsList = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./processed/icons.json"), "utf-8")
);

const generateReactComponents = () => {
  iconsList.forEach(async (iconName) => {
    const svgCode = fs.readFileSync(`./svgs/${iconName}.svg`, "utf-8");
    const titleCasedIconName = titleCase(iconName).replace(/-/g, "");

    const jsCode = (
      await svgr(svgCode, {
        plugins: [
          "@svgr/plugin-svgo",
          "@svgr/plugin-jsx",
          "@svgr/plugin-prettier",
        ],
      })
    )
      .replace(
        `function SvgComponent(props) {`,
        `interface Props extends React.SVGAttributes<SVGElement> {
  size?: number;
}

export const ${titleCasedIconName} = ({ size = 24, ...props }: Props) => {`
      )
      .replace("width={24} height={24}", "width={size} height={size}")
      .replace("export default SvgComponent;", "");

    fs.writeFileSync(
      `./components/${titleCasedIconName}.tsx`,
      `/* This file is auto-generated */

${jsCode}`
    );
  });
};

generateReactComponents();
