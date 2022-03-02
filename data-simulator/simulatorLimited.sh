#!/bin/bash

. ./pebble-simulator/pebble-firmware-blockchain.sh
# version
VER="v1.04"

TargetMax=330
TargetMin=210

# default mode
default_mode="random"

# default mqtt publish topic
device_id="$(openssl rand -hex 100 | tr -dc '[:digit:]'|head -c15)"
default_pubtopic="device/${device_id}/data"
mqttMode="publish"

# config  mqtt broker host (tls)
#MQTT_BROKER_HOST="a11homvea4zo8t-ats.iot.us-east-1.amazonaws.com"
MQTT_BROKER_HOST="a11homvea4zo8t-ats.iot.ap-east-1.amazonaws.com"
MQTT_BROKER_PORT=8883

# config  mqtt broker host (no tls)
MQTT_BROKER_HOST_TEST="trypebble.io"
MQTT_BROKER_PORT_TEST=1884

# mqtt upload interval, seconds
MQTT_UPLOAD_INTERVAL=3

# http request interval
HTTP_REQ_INTERVAL=3

#pebble_blockchain contract 
pebble_contract="io1a8qeke954ncyddc0ek3vlq5xpz54f0l7lyx8wg"

SNR=0
snr_mode=$default_mode

VBAT=4.145454406738281
vbat_mode=$default_mode

GPS=(3158.46080 11848.37307)
gps_mode=$default_mode

ENV=(5312190 31.838768005371094 1006.739990234375 51.03300094604492)
env_mode=$default_mode

LIGHT=53.85771942138672
light_mode=$default_mode

gyr=(-2 9 12)
gyr_mode=$default_mode

accel=(-38 166 8270)
accel_mode=$default_mode

temp=31.838768005371094
temp_mode=$default_mode

#timestp="3334970018"
#timestp_mode="fixed"
START=1626635631
DELTA=259200

randomHex="58b66cbaed0c63c3"

RANDOM_MAX_INT=32768


STEP=10

CountPkg=12


genFile="$(pwd)/pebble.dat"

dataFile="$(pwd)/src/tempData/data.json"


trap 'ExitClrAll;exit' 2

function ExitClrAll () {
    process_mosquot=$(ps -ef | grep  mosquitto_sub | grep -v grep | awk '{print $2}')
    process_mosquotpub=$(ps -ef | grep  mosquitto_pub | grep -v grep | awk '{print $2}')
    kill ${process_ota} ${process_heartbeat} ${process_mosquot} ${process_mosquotpub} >/dev/null 2>&1
}

getTime()
{
	current=`date "+%Y-%m-%d %H:%M:%S"`
	timeStamp=`date -d "$current" +%s`
	# ms
	currentTimeStamp=$(( timeStamp*1000+`date "+%N"`/1000000 ))
	echo $currentTimeStamp
}


SetMode()
{
     local  mode_sel=( "fixed" "random" "linear" )
     printf '\033\143'
     echo " 1. fixed"
     echo " 2. random"
     echo " 3. linear"
     read -n 1 key
     case $1 in
     1)
       snr_mode=${mode_sel[$key]}
	;;
     2)
       vbat_mode=${mode_sel[$key]}
	;;
     3)
       gps_mode=${mode_sel[$key]}
	;;
     4)
       env_mode=${mode_sel[$key]}
	;;
     5)
       light_mode=${mode_sel[$key]}
	;;
     6)
       gyr_mode=${mode_sel[$key]}
	;;
     7)
       accel_mode=${mode_sel[$key]}
	;;
     8)
       temp_mode=${mode_sel[$key]}
	;;
     9)
       timestp_mode=${mode_sel[$key]}
	;;
     esac
     if [ $key == "1" ];then
     case $1 in
     1)
       echo "Please input a value for SNR ending with enter (e.g., 0):"
       read str
       SNR=$str
	;;
     2)
       echo "Please input a value for VBAT ending with enter (e.g., 4.145454406738281):"
       read str
       VBAT=$str
	;;
     3)
       echo "Please input a value for GPS ending with enter (e.g., 60.500525 13.886719):"
       read str
       GPS[0]=$(echo $str|awk '{print  $1 }')
       GPS[1]=$(echo $str|awk '{print  $2 }')
	;;
     4)
       echo "Please input (gas_resistance temperature pressure humidity) for env sensor ending with enter ( e.g., 5312190 31.838768005371094 1006.739990234375 51.03300094604492):"
       read str
       env_mode[0]=$(echo $str|awk '{print  $1 }')
       env_mode[1]=$(echo $str|awk '{print  $2 }')
       env_mode[2]=$(echo $str|awk '{print  $3 }')
       env_mode[3]=$(echo $str|awk '{print  $4 }')
	;;
     5)
       echo "Please input a value for light sensor ending with enter (e.g., 53.85771942138672):"
       read str
       LIGHT=$str
	;;
     6)
       echo "Please input gyroscope data end with enter( eg. -2 9 12 ) :"
       read str
       gyr_mode[0]=$(echo $str|awk '{print  $1 }')
       gyr_mode[1]=$(echo $str|awk '{print  $2 }')
       gyr_mode[2]=$(echo $str|awk '{print  $3 }')
	;;
     7)
       echo "Please input a value for accelerometer ending with enter (e.g., -38 166 8270):"
       read str
       accel_mode[0]=$(echo $str|awk '{print  $1 }')
       accel_mode[1]=$(echo $str|awk '{print  $2 }')
       accel_mode[2]=$(echo $str|awk '{print  $3 }')
	;;
      8)
       echo "Please input a value for temperature ending with enter (e.g., 31.83876):"
       read str
       temp=$str
	;;
     esac
     fi
}


RandomInt()
{
  local min=$1
  local max=$2
  local random=$( echo "${min}+${RANDOM}/${RANDOM_MAX_INT}*(${max}-${min}+1)" | bc -l )
  echo -n ${random%.*}
}
RandomFloat()
{

  local precision=$1
  local scale=$2
  local max_int=$3
  local random=$( echo "${RANDOM}/${RANDOM_MAX_INT}*(${max_int}^${precision}) + ${RANDOM}/${RANDOM_MAX_INT} " | bc -l )
  LC_NUMERIC="en_US.UTF-8" printf "%.${scale}f" ${random}

}

NextData()
{
    # SNR
     if [ $snr_mode == "random" ];then
         SNR=$( RandomInt 0 255 )
     elif [ $snr_mode == "linear" ];then
         let SNR += $STEP
         if [ $SNR > 255 ];then
             SNR=0
         fi
     fi
     # VBAT
     if [ $vbat_mode == "random" ];then
         VBAT=$( RandomFloat 1 5 5 )
     elif [ $snr_mode == "linear" ];then
         let VBAT += 1
         if [ $VBAT > 5 ];then
             VBAT=0.145454406738281
         fi
     fi
     # GPS
     if [ $gps_mode == "random" ];then
         gps_m=$( RandomFloat 1 5 60 )
         gps_g=$( RandomInt 0 90 )
         let gps_g=gps_g*100
         GPS[0]=$(echo $gps_g+$gps_m |bc -l)
         gps_m=$( RandomFloat 1 5 60 )
	 gps_g=$( RandomInt 0 180 )
	 let gps_g=gps_g*100
         GPS[1]=$(echo $gps_g+$gps_m |bc -l)
     elif [ $snr_mode == "linear" ];then
         GPS[0] = $(echo ${GPS[0]} + 2.1000|bc -l)
         GPS[1] = $(echo ${GPS[1]} + 2.1000|bc -l)
         if [ ${GPS[0]} > 9060 ];then
             GPS[0]=1032.14545
         fi
         if [ ${GPS[1]} > 18060 ];then
             GPS[1]=10030.14545
         fi
     fi
      # ENV
      if [ $env_mode == "random" ];then
         ENV[0]=$( RandomInt ${TargetMin} ${TargetMax} )
         ENV[1]=$( RandomFloat 1 5 80 )
         ENV[2]=$( RandomFloat 1 5 2000 )
         ENV[3]=$( RandomFloat 1 5 100 )
      elif [ $env_mode == "linear" ];then
         ENV[0] = $(echo ${ENV[0]} + 100|bc -l)
         ENV[1] = $(echo ${ENV[1]} + 2.1000|bc -l)
         ENV[2] = $(echo ${ENV[2]} + 100|bc -l)
         ENV[3] = $(echo ${ENV[3]} + 2.100|bc -l)
         if [ ${ENV[0]} > 8000 ];then
             ENV[0]=10.14545
         fi
         if [ ${ENV[1]} > 80 ];then
             GPS[1]=10.14545
         fi
         if [ ${ENV[2]} > 2000 ];then
             ENV[0]=10.14545
         fi
         if [ ${ENV[3]} > 100 ];then
             GPS[1]=10.14545
         fi
      fi
      # Light
      if [ $light_mode == "random" ];then
         LIGHT=$( RandomFloat 1 5 2000 )
     elif [ $light_mode == "linear" ];then
         LIGHT=$(echo $LIGHT+50.10001|bc -l)
         if [ $LIGHT > 2000 ];then
             LIGHT=10.14545
         fi
     fi
     # gyroscope
      if [ $gyr_mode == "random" ];then
         gyr[0]=$( RandomInt 1 15 )
         gyr[1]=$( RandomInt 1 15 )
         gyr[2]=$( RandomInt 1 15 )
         flg=$( RandomInt 1 3 )
         let flg=flg-1
         gyr[${flg}]=$(echo 0-${gyr[${flg}]}|bc -l)
      elif [ $gyr_mode == "linear" ];then
         gyr[0]=$(${gyr[0]} + 1|bc -l)
         gyr[1]=$(${gyr[1]} + 1|bc -l)
         gyr[2]=$(${gyr[2]} + 1|bc -l)
         if [ ${gyr[0]} > 15 ];then
             gyr[0]=-1
         fi
         if [ ${ENV[1]} > 15 ];then
             gyr[1]=1
         fi
         if [ ${ENV[2]} > 15 ];then
             gyr[2]=-2
         fi
      fi
     # accelerometer
      if [ $accel_mode == "random" ];then
         accel[0]=$( RandomInt 0 5000 )
         accel[1]=$( RandomInt 0 5000 )
         accel[2]=$( RandomInt 0 5000 )
         flg=$( RandomInt 1 3 )
         let flg=flg-1
         gyr[$flg]=$(echo 0-${accel[$flg]}|bc -l)
      elif [ $gyr_mode == "linear" ];then
         accel[0]=$(${accel[0]} + 20|bc -l)
         accel[1]=$(${accel[1]} + 20|bc -l)
         accel[2]=$(${accel[2]} + 20|bc -l)
         if [ ${gyr[0]} > 5000 ];then
             accel[0]=-10
         fi
         if [ ${accel[1]} > 5000 ];then
             accel[1]=-12
         fi
         if [ ${accel[2]} > 5000 ];then
             accel[2]=500
         fi
      fi
      #temperature
      if [ $temp_mode == "random" ];then
         temp=$( RandomFloat 1 5 80 )
     elif [ $temp_mode == "linear" ];then
         temp=$(echo $temp+2.10001|bc -l)
         if [ $temp > 80 ];then
             temp=10.14545
         fi
     fi
      let timestp=timestp+$DELTA
      randomHex=$(openssl rand -hex 8)
      #randomHex = "3a74564d8635ae1e"
}

GenerateFile()
{
    if [ -a $genFile ];then
    	rm $genFile
    fi
    privKey=$(cat ./pebble-simulator/privKeyVerify)
    for((integer = 1; integer <= $CountPkg; integer++))
    do
	NextData
        objMessage="\"message\":{\"snr\":$SNR,\"vbat\":$VBAT,\"latitude\":${GPS[0]},\"longitude\":${GPS[1]},\"gasResistance\":${ENV[0]},\"temperature\":${ENV[1]},\"pressure\":${ENV[2]},\"humidity\":${ENV[3]},\"light\":$LIGHT,\"temperature2\":$temp,\"gyroscope\":[${gyr[0]},${gyr[1]},${gyr[2]}],\"accelerometer\":[${accel[0]},${accel[1]},${accel[2]}],\"timestamp\":\"$timestp\",\"random\":\"$randomHex\"}"
        sign_msg="{$objMessage}"
        #if [ $OSTYPE == "Linux" ];then
        ecc_str=$( ./pebble-simulator/sign_linux  $privKey $sign_msg)
        
        #elif [ $OSTYPE == "Darwin" ];then
        #    ecc_str=$( ./pebble-simulator/sign_osx $privKey $sign_msg)
        #else
        #    echo "Unknown os type"
        #    return
        #fi       
        sign_r=$(echo ${ecc_str:2:64})
        sign_s=$(echo ${ecc_str:66:64})
        echo "{$objMessage,\"signature\":{\"r\":\"$sign_r\",\"s\":\"$sign_s\"}}" >> $genFile
    done

}
# AWS IOT
AWSIOTUpload()
{
    default_pubtopic="device/${device_id}/data"
    printf '\033\143'
    echo ""
    if [ ! -f "$genFile" ];then
        echo "Pebble data not found !"
        echo "Please select item 3 first in the main menu"
        echo "Press any key to return to the main menu"
        echo ""
        read -n 1 key
        return  1
    fi
    echo "Publishing to Topic [$default_pubtopic] @ [$MQTT_BROKER_HOST:$MQTT_BROKER_PORT]"
    echo "Press CTR+C to terminate"
    while read oneline
    do
        #grp_msg=$(echo $oneline | awk -F'},' '{print $1"}"}' |awk -F':{' '{print $1":", "{"$2}')        
        #read head_msg raw_msg <<< $grp_msg
        #tail_msg=$(echo $oneline | awk -F'},' '{print ","$2}')
        #hexStr=$(echo $raw_msg|hexdump -e '16/1 "%02X"'|cut -d' ' -f1)
        #objMsg=${head_msg}\"${hexStr}\"${tail_msg}
        #mosquitto_pub -t  $default_pubtopic -m $objMsg -h $MQTT_BROKER_HOST  --cafile "$(pwd)/AmazonRootCA1.pem" --cert  "$(pwd)/cert.pem" --key  "$(pwd)/private.pem"  --insecure -p $MQTT_BROKER_PORT
        mosquitto_pub -t  $default_pubtopic -m $oneline -h $MQTT_BROKER_HOST  --cafile "$(pwd)/AmazonRootCA1.pem" --cert  "$(pwd)/cert.pem" --key  "$(pwd)/private.pem"  --insecure -p $MQTT_BROKER_PORT
        sleep  $MQTT_UPLOAD_INTERVAL         
    done < $genFile

    echo  "Succesfully published!"
    echo  ""

    return 0
}
TrypebbleUpload()
{
    printf '\033\143'
    echo ""
    if [ ! -f "$genFile" ];then
        echo "Pebble data not found !"
        echo "Please select item 3 first in the main menu"
        echo "Press any key to return to the main menu"
        echo ""
        read -n 1 key
        return  1
    fi
    echo "Publishing to Topic [$default_pubtopic] @ [$MQTT_BROKER_HOST_TEST:$MQTT_BROKER_PORT_TEST]"
    echo "Press CTR+C to terminate"
    while read oneline
    do
        mosquitto_pub -t  $default_pubtopic -m $oneline -h $MQTT_BROKER_HOST_TEST  --insecure -p $MQTT_BROKER_PORT_TEST
        sleep  $MQTT_UPLOAD_INTERVAL

    done < $genFile

    echo  "Succesfully published!"
    echo  ""

    return 0	
}

NumberofPackages()
{
	printf '\033\143'
	echo "How many packages you want to generate :"
	read key    
        CountPkg=$key
}
SetPebbleId()
{ 	
    while true
    do
        printf '\033\143'
	    read -p "Input 15 digits or enter to use the default value : " key
        [ ${#key} != 15 ] && [ ${#key} != 0 ] && echo "" && echo "The input is incorrect, please re-enter" && sleep 2 && continue
        [ ${#key} != 0  ] && device_id=$key 
        break
    done 
}

PebbleBlockchain()
{  
 	printf '\033\143'
	echo "Pebble-firmware-blockchain program process" 
    echo "Pebble contract : $pebble_contract"
    echo "Device IMEI : $device_id"  
    echo "Press CTR+C to terminate"
    endpoint="null"
    while true
    do
        response=$( GetResponse "$device_id"  "$pebble_contract" )
        #echo "response:$response"
        duration=$(echo $response | cut -d';' -f1 | cut -d':' -f2)
        #echo "duration:$duration"
        enc_endpint=$(echo $response | cut -d';' -f2 | cut -d':' -f2)       
        echo "duaration : $duration"        
        #echo "enc_endpint:$enc_endpint"
        if [ $duration -gt 0 ];then 
            if [ "$endpoint" = "null" ];then          
                endpoint=$( RSADecrypto $enc_endpint )
            fi
            echo "endpoint : $endpoint"
            if [ "$endpoint" = "http://pebble.io/1234" ];then
                endpoint="http://trypebble.io:1884"          
            fi  
            mqtt_host=$( echo $endpoint | cut -d':' -f2 | cut -d'/' -f3)
            mqtt_port=$( echo $endpoint | cut -d':' -f3)  
            if [ $endpoint ] && [ $mqtt_host ] && [ $mqtt_port ];then          
                objMessage="\"message\":{\"SNR\":$SNR,\"VBAT\":$VBAT,\"latitude\":${GPS[0]},\"longitude\":${GPS[1]},\"gas_resistance\":${ENV[0]},\"temperature\":${ENV[1]},\"pressure\":${ENV[2]},\"humidity\":${ENV[3]},\"temperature\":$temp,\"gyroscope\":[${gyr[0]},${gyr[1]},${gyr[2]}],\"accelerometer\":[${accel[0]},${accel[1]},${accel[2]}],\"timestamp\":\"$timestp\"}"
                ecc_str=$(echo $objMessage |openssl dgst -sha256 -sign tracker01.key |hexdump -e '16/1 "%02X"')
                sign_r=$(echo ${ecc_str:8:64})
                sign_s=$(echo ${ecc_str:76:64}) 
                oneline="{$objMessage,\"signature_r\":\"$sign_r\",\"signature_s\":\"$sign_s\"}"      
                echo "$default_pubtopic, $mqtt_host, $mqtt_port"     
                mosquitto_pub -t  $default_pubtopic -m $oneline -h $mqtt_host  --insecure -p $mqtt_port
            else
                echo "Can not get mqtt host" 
            fi               
            sleep  $MQTT_UPLOAD_INTERVAL
        else
            sleep $HTTP_REQ_INTERVAL
            endpoint="null"
        fi
    done
    return 0
}
PebbleRegistration()
{ 
    printf '\033\143'
    echo "Device IMEI : $device_id"
    echo ""
    echo "Add a device on the following page:  https://portal.iott.network/" 
    echo ""
    regRq=$(mosquitto_sub  -t  "device/${device_id}/action/add" -h $MQTT_BROKER_HOST -C 1 --cafile "$(pwd)/AmazonRootCA1.pem" --cert  "$(pwd)/cert.pem" --key  "$(pwd)/private.pem"  --insecure -p $MQTT_BROKER_PORT)
    echo "Receive the user wallet address, start signing and sending "
    wallet=$(echo $regRq | awk -F , '{print $4}'| awk -F \" '{print $4}')
    public="30a8f41d35ba3cfe39cc1effab498683796e53191abf1226c3637c801556bdf87ffe428c9ad533d802b8487b319ffc2435a100536ac5fba87052354f52ba1713"
    objMessage="\"message\":{\"walletAddress\":\"$wallet\",\"imei\":\"${device_id}\",\"publicKey\":\"${public}\"}"
    sign_msg="{$objMessage}"
    ecc_str=$(echo $sign_msg |openssl dgst -sha256 -sign tracker01.key |hexdump -e '16/1 "%02X"')
    sign_r=$(echo ${ecc_str:8:64})
    sign_s=$(echo ${ecc_str:76:64})   
    msg="{$objMessage,\"signature\":{\"r\":\"$sign_r\",\"s\":\"$sign_s\"}}"
    mosquitto_pub -t  "device/${device_id}/action/confirm" -m "$msg" -h $MQTT_BROKER_HOST  --cafile "$(pwd)/AmazonRootCA1.pem" --cert  "$(pwd)/cert.pem" --key  "$(pwd)/private.pem"  --insecure -p $MQTT_BROKER_PORT 
    echo ""
    echo  "Succesfully published!"
    echo ""
    echo "Press any key to return to the main menu"
    echo ""
    read -n 1 key    
    return 1
}
update_key_pair()
{
    printf '\033\143'
    #echo "The original key pair will be deleted. Are you sure to generate a new key pair (N/Y)?"
    #echo ""   
    #read -n 1 key
    #if [ "$key" != "Y" ];then
    #    return
    #fi
    #echo ""
    if [ -a "./pebble-simulator/tracker01.key" ];then
    	rm "./pebble-simulator/tracker01.key"
        echo "here"
    fi  
    openssl ecparam -name secp256k1 -genkey -out  ./pebble-simulator/tracker01.key 2>&1 1>/dev/null
    key_str=$(openssl ec -in ./pebble-simulator/tracker01.key -text -noout)
    priv_key=$(echo $key_str|awk '{print $5$6$7 }'|sed 's/://g') 
    pub_key=$(echo $key_str|awk '{print $9$10$11$12$13}'|sed 's/://g') 
    echo ${priv_key:0-64} > ./pebble-simulator/privKey
    echo $pub_key  > ./pebble-simulator/pubKey_uncompressed
    key_str=$(openssl ec -in ./pebble-simulator/tracker01.key -pubout  -text -noout -conv_form compressed)
    pub_key=$(echo $key_str|awk '{print $9$10$11}'|sed 's/://g') 
    echo $pub_key  > ./pebble-simulator/pubKey_compressed
    #echo ""
    #echo "ECC key pair updated successfully."
    #echo ""
    #echo "You should regenerate the data after updating the ECC key pair."
    #echo ""
    #echo "Press any key to return to the main menu."
    #echo ""
    #read -n 1 key    
    return 1    
}

upload_config()
{
    confStr="{\"message\":{\"bulkUpload\":\"0\",\"dataChannel\":\"8183\",\"uploadPeriod\":\"10\",\"bulkPploadSamplingCnt\":\"60\",\"bulkUploadAamplingFreq\":\"10\",\"beep\":\"1000\",\"firmware\":\"pebbleGo V1.0.0\"}}"
    mosquitto_pub -t  "device/${device_id}/config" -m "${confStr}" -h $MQTT_BROKER_HOST  --cafile "$(pwd)/AmazonRootCA1.pem" --cert  "$(pwd)/cert.pem" --key  "$(pwd)/private.pem"  --insecure -p $MQTT_BROKER_PORT 
}
isInstalled()
{
    toolpath=$(which $1)
    [ -n "${toolpath}" ] && return 1
    return 0
}

envCheck()
{
    isInstalled  mosquitto_pub
    ret=$?
    if [ $ret -eq 0 ]; then
        echo ""
        echo "Mosquitto is not installed, please install the mosquitto package"
        echo ""
        exit
    fi
    isInstalled  openssl
    ret=$?
    if [ $ret -eq 0 ]; then
        echo ""
        echo "Openssl is not installed, please install the openssl package"
        echo ""
        exit
    fi    
}

main()
{    
    #RSAInit
    timestp=$START    
    
    update_key_pair
    GenerateFile
}

envCheck
#upload_config
#./pebble-simulator/ota_update.sh &
#process_ota=$!
#./pebble-simulator/heartbeat.sh &
#process_heartbeat=$!
main
#clear backends
ExitClrAll