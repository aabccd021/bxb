#!/bin/bash
set -euo pipefail

function myFunction() {
	yarn server:test:cached
	return $?
}

retry=0
maxRetries=2
retryInterval=5
until [ ${retry} -ge ${maxRetries} ]
do
	myFunction && break
	retry=$[${retry}+1]
	echo "Retrying [${retry}/${maxRetries}] in ${retryInterval}(s) "
	sleep ${retryInterval}
done

if [ ${retry} -ge ${maxRetries} ]; then
  echo "Failed after ${maxRetries} attempts!"
  exit 1
fi