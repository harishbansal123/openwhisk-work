## Installation
### vagrant

###### Prerequisite

The local system should have virtual box >5 and vagrant >1.8 installed and the machine should have virtualization enabled in the bios. The user should be an administrator.

The vagrant single host installation is available in the git repository of apache open whisk.

###### Linux/mac box
**``git clone https://github.com/apache/incubator-openwhisk.git openwhisk``**

use the package manager of the operating system to install GIT client.

###### Windows box
Use tortoise GIT or GIT bash for installing GIT.
Clone the repository ** https://github.com/apache/incubator-openwhisk.git**

After cloning the repository, navigate to ``tools/vagrant`` in the git directory.
run command ``vagrant up``

vagrant provisioning will install python, Java 8, scala, docker, ansible.  At its running state, the docker containers required for openwhisk will be up and and running which includes couchdb, apigateway, consul, kafka etc...

The default vagrant/ubuntu installation will install regular packages like watson, weather, echo, websocket etc... For installing openwhisk-messaging and openwhisk-alarms follow the below mentioned steps mentioned below in [Kafka Setup] (#Kafka Example Setup) and [Alarm Setup] (#scheduler)

### ubuntu
Ubuntu installation is broken down into 4 steps
1. Installation of git and htop through the apt package manager and cloning the source code from git repo. ``git clone https://github.com/apache/incubator-openwhisk.git openwhisk ``
2. run `` source all.sh`` available in the directory openwhisk/tools/ubuntu for installing pip, docker, java, scala, anisble.
3. run ``./gradlew distDocker`` for building docker images.
4. setting up whisk by running ansible recipies.
  * sudo ansible-playbook -i environments/local prereq.yml
  * sudo ansible-playbook -i environments/local setup.yml
  * sudo ansible-playbook -i environments/local couchdb.yml
  * sudo ansible-playbook -i environments/local initdb.yml
  * sudo ansible-playbook -i environments/local wipe.yml
  * sudo ansible-playbook -i environments/local apigateway.yml
  * sudo ansible-playbook -i environments/local -e docker_image_prefix=openwhisk openwhisk.yml
  * sudo ansible-playbook -i environments/local postdeploy.yml



## Language actions
### JavaScript Action
1.	``wsk action create weather action/js/weather.js``
2.	``wsk action invoke --result weather --param location "Brooklyn, NY"``

### Java Action
cd action/java

Download gson-2.2.2.jar

1.	``javac -classpath gson-2.2.2.jar Hello.java``
2.	``jar cvf hello.jar Hello.class``
3.	``wsk action create helloJava hello.jar --main Hello``
4.	``wsk action invoke --result helloJava --param name World``

### Python Action
cd action/python

1.	``wsk action create helloPython hello.py``
2.	``wsk action invoke --result helloPython --param name World``

### Swift Action
cd action/swift

1.	``wsk action create helloSwift hello.swift``
2.	``wsk action invoke --result helloSwift --param name World``


### Kafka Example Setup
##### Clone openwhisk kafka package

``git clone https://github.com/apache/incubator-openwhisk-package-kafka``

Go to incubator-openwhisk-package-kafka directory

Open action/lib/common.js file and replace ``whisk.system`` with ``guest`` and save the file

##### Run installKafka.sh

``./installKafka <authkey> <edgehost> <dburl> <dbprefix> <apihost>``

  Get auth and api host from .wskprops file location in the home directory (/home/vagrant)
	
  edgehost - ``172.17.0.1``
	
  dburl - ``http://whisk_admin:some_passw0rd@172.17.0.1:5984``
	
  dbprefix - ``<anythin>``

##### create env.list file with following properties
  
  ``LOCAL_DEV=True``

  ``DB_USER=whisk_admin``
  
  ``DB_PASS=some_passw0rd``
  
  ``DB_URL=http://172.17.0.1:5984``
  
  ``DB_PREFIX=<same as given in previous step>``

##### Run the following command

``./gradlew distDocker``

##### Run the Docker Container

``docker run --env-file env.list -v <logs dir on host machine>:/logs -d catalog_kafkatrigger``

##### Build the kafkaaction

``cd action/kakfa``

``npm install`` (install nodejs/npm before running this command)

``zip -r kafkaacion.zip *``

``wsk action create kafkaaction kafkaaction.zip --kind nodejs:6``

##### Create a trigger

Assuming the kafka server is running in vagrant machine itself on port 9093 and topic name is test

``wsk trigger create mykafkatrigger --feed messaging/kafkaFeed --param brokers "[\"172.17.0.1:9093\"]" --param topic test --param isJSONData true``

##### Create a rule
``wsk rule create mykafkarule mykafkatrigger mykafkaaction``

##### Run following command to view action invocations
``wsk activation poll``

Send a message to kafka server and monitor above command

This will trigger mykafkatrigger which will in turn invoke mykafkarule which is in turn invoke mykafkaaction.

mykafkaaction expects following message

{"temp": some_number}

If temp < 10  then it returns {"weather": "cold"}

if temp >= 10 and temp < 30 then it returns {"weather": "pleasant"}

else it returns {"weather": "hot"}
