#!/bin/sh

taskId=$1
playbook=$2
playbookFolder=$3
tierFolder=$4
logFileName=$5
ansibleFolder=$6

fullLog=$playbookFolder/logs/$logFileName

echo "--------------------------------------------------------------------" >> $fullLog
echo "=> Starting process [$(date +"%Y/%m/%d %I:%M:%S %p")]" >> $fullLog
echo "--------------------------------------------------------------------" >> $fullLog
echo "" >> $fullLog

cd $ansibleFolder
ansible-playbook -i $playbookFolder/hosts $tierFolder/$playbook >> $fullLog

echo "--------------------------------------------------------------------" >> $fullLog
echo "=> Finishing process [$taskId] [$(date +"%Y/%m/%d %I:%M:%S %p")]" >> $fullLog
echo "--------------------------------------------------------------------" >> $fullLog
echo "" >> $fullLog
