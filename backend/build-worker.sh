#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing deps via poetry..."
pip install poetry==1.5.1
poetry --version
poetry install
