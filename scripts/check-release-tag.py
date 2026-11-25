import json
import os
import re
import sys
import tomllib
from pathlib import Path


tag = sys.argv[1]
pattern = r"^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-(alpha|beta|rc)\.(0|[1-9][0-9]*))?$"
if not re.fullmatch(pattern, tag):
    sys.exit(f"Invalid SemVer release tag: {tag}")

version = tag[1:]
versions = {
    "package.json": json.loads(Path("package.json").read_text())["version"],
    "src-tauri/Cargo.toml": tomllib.loads(Path("src-tauri/Cargo.toml").read_text())["package"]["version"],
    "src-tauri/tauri.conf.json": json.loads(Path("src-tauri/tauri.conf.json").read_text())["version"],
}
for path, manifest_version in versions.items():
    if manifest_version != version:
        sys.exit(f"{path} version {manifest_version!r} does not match tag version {version!r}")

is_prerelease = "-" in version
metadata = (
    f"version={version}\n"
    f"is_prerelease={str(is_prerelease).lower()}\n"
    f"make_latest={str(not is_prerelease).lower()}\n"
)
print(metadata, end="")
if output := os.environ.get("GITHUB_OUTPUT"):
    with open(output, "a") as handle:
        handle.write(metadata)
