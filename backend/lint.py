#!/usr/bin/env python3
"""
Runs core linting methods. Use --fix to automatically format code.
"""

import argparse
import os.path
import pathlib
import subprocess
import sys
import tempfile

BACKEND_PATH = pathlib.Path(os.path.relpath(pathlib.Path(__file__).parent))
FRONTEND_PATH = pathlib.Path(os.path.relpath(BACKEND_PATH / ".." / "frontend"))


def blue(text):
    return f"\033[96m{text}\033[0m"


def red(text):
    return f"\033[91m{text}\033[0m"


def shell(cmd, stdout=None):
    print(blue(cmd))
    return subprocess.run(cmd, shell=True, check=True, stdout=stdout)


def install_openapi():
    try:
        openapi_version = (
            subprocess.check_output("openapi --version", shell=True)
            .decode("utf-8")
            .strip()
        )
    except Exception:
        openapi_version = ""

    if openapi_version != "0.17.0":
        shell("yarn global add openapi-typescript-codegen@0.17.0")


def git_diff_frontend_client():
    return (
        subprocess.check_output(f"git diff {FRONTEND_PATH}/src/lib/api/", shell=True)
        .decode("utf-8")
        .strip()
    )


def generate_api_client():
    install_openapi()
    shell(
        f"python {BACKEND_PATH}/manage.py generate_swagger"
        f" -o {BACKEND_PATH}/swagger.json"
    )
    shell(
        f"openapi --input {BACKEND_PATH}/swagger.json"
        f" --output {FRONTEND_PATH}/src/lib/api --client axios"
    )


def check_api_client():
    with tempfile.NamedTemporaryFile() as tmpfile:
        shell(f"python {BACKEND_PATH}/manage.py generate_swagger -o {tmpfile.name}")
        shell(f"diff {BACKEND_PATH}/swagger.json {tmpfile.name} > /dev/null")

    if not git_diff_frontend_client():
        generate_api_client()

        if git_diff_frontend_client():
            print(
                red("Found diff in openapi generated client. Run lint.py --fix to fix.")
            )
            shell(f"git checkout {FRONTEND_PATH}/src/lib/api")
            sys.exit(1)
    else:
        # Note that in CI this will never happen. Locally we should ignore running
        # the final check for openapi generation until the user has stashed/committed
        # changes.
        print(
            red(
                "Uncommitted changes found in frontend/src/lib/api. Ignoring"
                " openapi generation..."
            )
        )


def lint(*, fix):
    if fix:
        shell(f"black {BACKEND_PATH}")
        shell(f"isort {BACKEND_PATH}")
        generate_api_client()
    else:
        shell(f"black {BACKEND_PATH} --check")
        shell(f"isort {BACKEND_PATH} -c")
        check_api_client()
        shell(f"flake8 {BACKEND_PATH}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lints python code.")
    parser.add_argument(
        "-f", "--fix", action="store_true", help="Run back and isort to format code."
    )
    args = parser.parse_args()

    lint(fix=args.fix)
