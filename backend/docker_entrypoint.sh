#!/bin/sh

echo "Migrating Django Database"
# python manage.py flush --no-input
python manage.py migrate
cat ./sqls/views/*.sql | python manage.py dbshell

echo "Ingesting Database fixtures"
python manage.py generate_test_data --wallet 0xf407dF7897ADa7B18Be503f6E45b992a682c3906 --generate-players

exec "$@"
