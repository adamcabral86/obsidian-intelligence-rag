import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.argv[2];
const manifestFile = "manifest.json";
const packageFile = "package.json";

// Read current manifest
let manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
let packageJson = JSON.parse(readFileSync(packageFile, "utf8"));

// Update version
manifest.version = targetVersion;
packageJson.version = targetVersion;

// Write updated manifest
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
writeFileSync(packageFile, JSON.stringify(packageJson, null, 2));

console.log(`Version updated to ${targetVersion}`); 